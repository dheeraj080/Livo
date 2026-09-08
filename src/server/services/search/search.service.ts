import { getElasticsearchClient } from './client';
import { ensureNotesIndexExists, ensureChunksIndexExists, NOTES_INDEX, CHUNKS_INDEX, type NoteSearchDocument } from './indices';
import { notesRepository } from '../../repositories/notes.repository';
import { AiService } from '../ai/ai.service';
import { logger } from '@/src/server/lib/logger';
import type { SearchResultItem } from '@/src/types';

export interface SearchNotesParams {
  /**
   * CRITICAL SECURITY REQUIREMENT:
   * Every search query must be scoped by user_id.
   * Never allow a caller to search another user's documents.
   */
  userId: string;
  query?: string;
  notebookId?: string;
  tagIds?: string[];
  fromDate?: string | Date;
  toDate?: string | Date;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'updated_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  noteId?: string; // Exact note filtering
  searchMode?: 'keyword' | 'semantic' | 'hybrid';
}

export interface SearchNotesResponse {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: SearchResultItem[];
  source: 'elasticsearch' | 'database_fallback';
}

export class SearchService {
  /**
   * Performs semantic vector search on note chunks using Elasticsearch knn vector similarity.
   * STRICT SECURITY: Unconditionally filtered by user_id.
   */
  async semanticSearch(query: string, userId: string, limit = 20): Promise<SearchResultItem[]> {
    if (!query || !query.trim() || !userId) return [];
    const client = getElasticsearchClient();
    if (!client) return [];

    try {
      await ensureChunksIndexExists();
      const queryEmbedding = await AiService.generateEmbedding(query);

      const response = await client.search({
        index: CHUNKS_INDEX,
        size: limit * 3,
        knn: {
          field: 'embedding',
          query_vector: queryEmbedding,
          k: limit * 3,
          num_candidates: 150,
          filter: [
            { term: { user_id: userId } },
          ],
        },
      });

      const hits = response.hits.hits || [];
      const noteMap = new Map<string, { noteId: string; title: string; notebookId?: string; tags: string[]; updatedAt: string; maxScore: number; bestSnippet: string; position: number }>();

      for (const hit of hits) {
        const src: any = hit._source || {};
        const noteId = src.note_id;
        if (!noteId) continue;
        const score = hit._score || 0;
        const textSnippet = src.text || '';

        if (!noteMap.has(noteId) || score > noteMap.get(noteId)!.maxScore) {
          noteMap.set(noteId, {
            noteId,
            title: src.title || 'Untitled Note',
            notebookId: src.notebook_id || undefined,
            tags: src.tags || [],
            updatedAt: src.updated_at || new Date().toISOString(),
            maxScore: score,
            bestSnippet: textSnippet.slice(0, 160) + (textSnippet.length > 160 ? '...' : ''),
            position: src.chunk_position || 0,
          });
        }
      }

      const sortedNotes = Array.from(noteMap.values())
        .sort((a, b) => b.maxScore - a.maxScore)
        .slice(0, limit);

      return sortedNotes.map((n) => ({
        id: n.noteId,
        title: n.title,
        snippet: n.bestSnippet,
        score: n.maxScore,
        notebookId: n.notebookId,
        tags: n.tags,
        updatedAt: n.updatedAt,
      }));
    } catch (error) {
      logger.error({ service: 'search', event: 'semantic_search_failed', userId, error });
      return [];
    }
  }

  /**
   * Performs hybrid search combining BM25 keyword search and semantic vector search
   * using Reciprocal Rank Fusion (RRF).
   */
  async hybridSearch(params: SearchNotesParams, page: number, pageSize: number): Promise<SearchNotesResponse> {
    const query = params.query || '';
    const userId = params.userId;

    if (!query.trim()) {
      return this.searchNotes({ ...params, searchMode: 'keyword' });
    }

    const [keywordResp, semanticResults] = await Promise.all([
      this.searchNotes({ ...params, searchMode: 'keyword', pageSize: 50 }),
      this.semanticSearch(query, userId, 50),
    ]);

    const keywordResults = keywordResp.results;

    const k = 60;
    const rrfMap = new Map<string, { item: SearchResultItem; rrfScore: number }>();

    keywordResults.forEach((item, rank) => {
      const score = 1 / (k + rank + 1);
      rrfMap.set(item.id, { item, rrfScore: score });
    });

    semanticResults.forEach((item, rank) => {
      const score = 1 / (k + rank + 1);
      if (rrfMap.has(item.id)) {
        const existing = rrfMap.get(item.id)!;
        existing.rrfScore += score;
      } else {
        rrfMap.set(item.id, { item, rrfScore: score });
      }
    });

    const fused = Array.from(rrfMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map((entry) => ({
        ...entry.item,
        score: entry.rrfScore,
      }));

    const total = fused.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginatedResults = fused.slice((page - 1) * pageSize, page * pageSize);

    return {
      total,
      page,
      pageSize,
      totalPages,
      results: paginatedResults,
      source: 'elasticsearch',
    };
  }

  /**
   * Searches notes using Elasticsearch lexical full-text BM25 index, semantic vector search, or hybrid RRF.
   * STRICT SECURITY ENFORCEMENT: All queries are unconditionally filtered by userId.
   */
  async searchNotes(params: SearchNotesParams): Promise<SearchNotesResponse> {
    const startTime = Date.now();

    // 1. Mandatory Security Assertion
    if (!params.userId || typeof params.userId !== 'string' || !params.userId.trim()) {
      const error = new Error('SECURITY VIOLATION: userId is strictly required to scope note searches.');
      logger.error({
        service: 'search',
        event: 'search_rejected_missing_user_id',
        error,
      });
      throw error;
    }

    const userId = params.userId.trim();
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
    const searchMode = params.searchMode || 'hybrid';
    const queryStr = params.query?.trim();

    const client = getElasticsearchClient();

    // 2. Fallback if Elasticsearch is unconfigured or unreachable
    if (!client) {
      logger.warn({
        service: 'search',
        event: 'search_es_unavailable_falling_back_to_db',
        userId,
        meta: { query: params.query },
      });
      return this.fallbackSearchDatabase(userId, params, page, pageSize, startTime);
    }

    // Handle Semantic Mode
    if (searchMode === 'semantic' && queryStr) {
      try {
        const results = await this.semanticSearch(queryStr, userId, pageSize);
        return {
          total: results.length,
          page,
          pageSize,
          totalPages: 1,
          results,
          source: 'elasticsearch',
        };
      } catch (error) {
        console.error('[SearchService] Semantic search error:', error);
      }
    }

    // Handle Hybrid Mode
    if (searchMode === 'hybrid' && queryStr) {
      try {
        return await this.hybridSearch(params, page, pageSize);
      } catch (error) {
        console.error('[SearchService] Hybrid search error, falling back to keyword:', error);
      }
    }

    // Default Keyword Search (BM25)
    const from = (page - 1) * pageSize;

    try {
      await ensureNotesIndexExists();

      // 3. Build Filter Clauses (Unconditionally user-scoped)
      const filterClauses: any[] = [
        {
          term: {
            user_id: userId,
          },
        },
      ];

      // Exact note filtering
      if (params.noteId && params.noteId.trim()) {
        filterClauses.push({
          term: {
            note_id: params.noteId.trim(),
          },
        });
      }

      // Notebook filtering
      if (params.notebookId && params.notebookId.trim()) {
        filterClauses.push({
          term: {
            notebook_id: params.notebookId.trim(),
          },
        });
      }

      // Tag filtering (matches notes that have any of the specified tag IDs)
      if (params.tagIds && params.tagIds.length > 0) {
        const cleanedTags = params.tagIds.filter((t) => Boolean(t && t.trim()));
        if (cleanedTags.length > 0) {
          filterClauses.push({
            terms: {
              tags: cleanedTags,
            },
          });
        }
      }

      // Date filtering (on updated_at or created_at)
      if (params.fromDate || params.toDate) {
        const range: Record<string, string> = {};
        if (params.fromDate) {
          range.gte = new Date(params.fromDate).toISOString();
        }
        if (params.toDate) {
          range.lte = new Date(params.toDate).toISOString();
        }
        filterClauses.push({
          range: {
            updated_at: range,
          },
        });
      }

      // 4. Build Must Clauses (Lexical Title & Full-Text Content Search)
      let queryClause: any;

      if (queryStr) {
        queryClause = {
          bool: {
            must: [
              {
                multi_match: {
                  query: queryStr,
                  fields: ['title^3', 'title.keyword^2', 'content', 'tags^1.5'],
                  type: 'best_fields',
                  fuzziness: 'AUTO',
                  operator: 'or',
                },
              },
            ],
            filter: filterClauses,
          },
        };
      } else {
        // Filter-only search
        queryClause = {
          bool: {
            must: [{ match_all: {} }],
            filter: filterClauses,
          },
        };
      }

      // 5. Sorting configuration
      const sortOrder = params.sortOrder || 'desc';
      let sort: any[] = [];

      if (params.sortBy === 'updated_at') {
        sort = [{ updated_at: { order: sortOrder } }];
      } else if (params.sortBy === 'created_at') {
        sort = [{ created_at: { order: sortOrder } }];
      } else if (params.sortBy === 'relevance' || (!params.sortBy && queryStr)) {
        sort = [
          { _score: { order: sortOrder } },
          { updated_at: { order: 'desc' } },
        ];
      } else {
        // Default sorting
        sort = [{ updated_at: { order: 'desc' } }];
      }

      // 6. Execute Elasticsearch Search
      const response = await client.search<NoteSearchDocument>({
        index: NOTES_INDEX,
        from,
        size: pageSize,
        query: queryClause,
        sort,
        highlight: {
          pre_tags: ['<mark class="bg-amber-200 text-stone-900 rounded-xs px-0.5">'],
          post_tags: ['</mark>'],
          fields: {
            title: { number_of_fragments: 1 },
            content: { number_of_fragments: 2, fragment_size: 140 },
          },
        },
      });

      const totalHits =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;

      const hits = response.hits.hits || [];
      const results: SearchResultItem[] = hits.map((hit) => {
        const src = hit._source || ({} as Partial<NoteSearchDocument>);
        const highlightContent = hit.highlight?.content?.join(' ... ');
        const highlightTitle = hit.highlight?.title?.[0];

        const snippet =
          highlightContent ||
          (src.content ? src.content.slice(0, 160) + (src.content.length > 160 ? '...' : '') : '');

        return {
          id: hit._id || src.note_id || '',
          title: highlightTitle || src.title || 'Untitled Note',
          snippet,
          score: hit._score || 0,
          notebookId: src.notebook_id || undefined,
          tags: src.tags || [],
          updatedAt: src.updated_at || new Date().toISOString(),
        };
      });

      const totalPages = Math.ceil(totalHits / pageSize) || 1;
      const durationMs = Date.now() - startTime;

      logger.info({
        service: 'search',
        event: 'search_executed',
        userId,
        durationMs,
        meta: {
          query: queryStr,
          totalHits,
          returnedHits: results.length,
          page,
          pageSize,
          sortBy: params.sortBy,
        },
      });

      return {
        total: totalHits,
        page,
        pageSize,
        totalPages,
        results,
        source: 'elasticsearch',
      };
    } catch (error: any) {
      logger.error({
        service: 'search',
        event: 'search_es_failed_falling_back',
        userId,
        durationMs: Date.now() - startTime,
        error,
      });

      // Gracefully fall back to PostgreSQL database lexical search if ES throws
      return this.fallbackSearchDatabase(userId, params, page, pageSize, startTime);
    }
  }

  /**
   * Fail-safe fallback search executed against the authoritative PostgreSQL store
   * if Elasticsearch is down, degraded, or still bootstrapping.
   */
  private async fallbackSearchDatabase(
    userId: string,
    params: SearchNotesParams,
    page: number,
    pageSize: number,
    startTime: number
  ): Promise<SearchNotesResponse> {
    const rawNotes = await notesRepository.listByUser(userId, {
      notebookId: params.notebookId,
      isTrashed: false,
      limit: 200,
    });

    const queryStr = (params.query || '').toLowerCase().trim();

    let filtered = rawNotes.filter((n) => {
      // Security check: Must strictly belong to user
      if (n.userId !== userId) return false;

      // Exact note filtering
      if (params.noteId && n.id !== params.noteId) return false;

      // Notebook filter
      if (params.notebookId && n.notebookId !== params.notebookId) return false;

      // Tag filter
      if (params.tagIds && params.tagIds.length > 0) {
        const noteTagIds = n.tags.map((t) => t.id);
        const hasMatchingTag = params.tagIds.some((tId) => noteTagIds.includes(tId));
        if (!hasMatchingTag) return false;
      }

      // Date filter
      if (params.fromDate && n.updatedAt < new Date(params.fromDate)) return false;
      if (params.toDate && n.updatedAt > new Date(params.toDate)) return false;

      // Lexical Query match
      if (queryStr) {
        const matchTitle = (n.title || '').toLowerCase().includes(queryStr);
        const matchContent = (n.contentText || '').toLowerCase().includes(queryStr);
        const matchTags = n.tags.some((t) => t.name.toLowerCase().includes(queryStr));
        if (!matchTitle && !matchContent && !matchTags) return false;
      }

      return true;
    });

    // Sorting
    if (params.sortBy === 'relevance' && queryStr) {
      filtered.sort((a, b) => {
        const aTitleMatch = (a.title || '').toLowerCase().includes(queryStr) ? 2 : 0;
        const bTitleMatch = (b.title || '').toLowerCase().includes(queryStr) ? 2 : 0;
        return bTitleMatch - aTitleMatch || b.updatedAt.getTime() - a.updatedAt.getTime();
      });
    } else {
      filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const results: SearchResultItem[] = paginated.map((n) => ({
      id: n.id,
      title: n.title,
      snippet: n.contentText?.slice(0, 160) || '',
      score: 1.0,
      notebookId: n.notebookId || undefined,
      tags: n.tags.map((t) => t.id),
      updatedAt: n.updatedAt.toISOString(),
    }));

    logger.info({
      service: 'search',
      event: 'search_database_fallback_completed',
      userId,
      durationMs: Date.now() - startTime,
      meta: { total, returned: results.length },
    });

    return {
      total,
      page,
      pageSize,
      totalPages,
      results,
      source: 'database_fallback',
    };
  }
}

export const searchService = new SearchService();

// Standalone function export matching requested interface
export const searchNotes = (params: SearchNotesParams) => searchService.searchNotes(params);

