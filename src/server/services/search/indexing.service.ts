import { getElasticsearchClient } from './client';
import { ensureNotesIndexExists, ensureChunksIndexExists, NOTES_INDEX, CHUNKS_INDEX, type NoteSearchDocument } from './indices';
import { chunkText, type NoteChunkDocument } from './chunker';
import { AiService } from '../ai/ai.service';
import { logger } from '@/src/server/lib/logger';

export interface NoteInputForIndexing {
  id?: string;
  note_id?: string;
  userId?: string;
  user_id?: string;
  notebookId?: string | null;
  notebook_id?: string | null;
  title?: string;
  content?: string;
  contentText?: string;
  plainText?: string;
  tags?: Array<string | { id?: string; name?: string }>;
  createdAt?: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
  updated_at?: string | Date;
}

/**
 * Normalizes various note representation formats (Drizzle row, API Note domain, or raw dict)
 * into a strict Elasticsearch NoteSearchDocument projection.
 */
function normalizeNoteForIndexing(note: NoteInputForIndexing): NoteSearchDocument {
  const noteId = note.note_id || note.id;
  const userId = note.user_id || note.userId;

  if (!noteId) {
    throw new Error('Indexing Error: note_id or id is required');
  }
  if (!userId) {
    throw new Error('Indexing Error: user_id or userId is required');
  }

  const rawTags = note.tags || [];
  const normalizedTags: string[] = rawTags
    .map((t) => {
      if (typeof t === 'string') return t;
      return t?.id || t?.name || '';
    })
    .filter((t) => Boolean(t && t.trim().length > 0));

  const createdAt = note.created_at || note.createdAt;
  const updatedAt = note.updated_at || note.updatedAt;

  const createdAtIso =
    createdAt instanceof Date
      ? createdAt.toISOString()
      : typeof createdAt === 'string'
      ? new Date(createdAt).toISOString()
      : new Date().toISOString();

  const updatedAtIso =
    updatedAt instanceof Date
      ? updatedAt.toISOString()
      : typeof updatedAt === 'string'
      ? new Date(updatedAt).toISOString()
      : new Date().toISOString();

  const content = note.contentText || note.plainText || note.content || '';

  return {
    note_id: noteId,
    user_id: userId,
    notebook_id: note.notebook_id ?? note.notebookId ?? null,
    title: (note.title || 'Untitled Note').trim(),
    content: content.trim(),
    tags: Array.from(new Set(normalizedTags)),
    created_at: createdAtIso,
    updated_at: updatedAtIso,
  };
}

export class IndexingService {
  /**
   * Index or replace a note in the Elasticsearch search projection,
   * including chunking and embedding generation for semantic retrieval.
   */
  async indexNote(note: NoteInputForIndexing): Promise<void> {
    const startTime = Date.now();
    const doc = normalizeNoteForIndexing(note);

    const client = getElasticsearchClient();
    if (!client) {
      const error = new Error('Elasticsearch client is unavailable for indexing');
      logger.warn({
        service: 'indexing',
        event: 'index_note_skipped_no_client',
        noteId: doc.note_id,
        userId: doc.user_id,
        error,
      });
      throw error;
    }

    try {
      await ensureNotesIndexExists();
      await ensureChunksIndexExists();

      // 1. Index full note document in notes index
      await client.index({
        index: NOTES_INDEX,
        id: doc.note_id,
        document: doc,
        refresh: false,
      });

      // 2. Remove existing chunks for this note
      await client.deleteByQuery({
        index: CHUNKS_INDEX,
        query: {
          term: { note_id: doc.note_id },
        },
        refresh: false,
      }).catch(() => {});

      // 3. Chunk note text and generate embeddings
      const rawText = `${doc.title}\n\n${doc.content}`;
      const textChunks = chunkText(rawText);

      for (let i = 0; i < textChunks.length; i++) {
        const chunkTextContent = textChunks[i];
        const chunkId = `${doc.note_id}_chunk_${i}`;
        const embedding = await AiService.generateEmbedding(chunkTextContent);

        const chunkDoc: NoteChunkDocument = {
          chunk_id: chunkId,
          note_id: doc.note_id,
          user_id: doc.user_id,
          notebook_id: doc.notebook_id,
          title: doc.title,
          text: chunkTextContent,
          chunk_position: i,
          metadata: {
            wordCount: chunkTextContent.split(/\s+/).length,
            charCount: chunkTextContent.length,
          },
          embedding,
          updated_at: doc.updated_at,
        };

        await client.index({
          index: CHUNKS_INDEX,
          id: chunkId,
          document: chunkDoc,
          refresh: false,
        });
      }

      logger.info({
        service: 'indexing',
        event: 'note_indexed_with_chunks',
        noteId: doc.note_id,
        userId: doc.user_id,
        durationMs: Date.now() - startTime,
        meta: {
          title: doc.title,
          chunksCount: textChunks.length,
          tagsCount: doc.tags.length,
          notebookId: doc.notebook_id,
        },
      });
    } catch (error: any) {
      logger.error({
        service: 'indexing',
        event: 'index_note_failed',
        noteId: doc.note_id,
        userId: doc.user_id,
        durationMs: Date.now() - startTime,
        error,
      });
      throw error;
    }
  }

  /**
   * Update a note projection in Elasticsearch.
   */
  async updateNote(note: NoteInputForIndexing): Promise<void> {
    return this.indexNote(note);
  }

  /**
   * Remove a note and its chunks from Elasticsearch search projections.
   */
  async deleteNote(noteId: string, userId?: string): Promise<void> {
    const startTime = Date.now();
    const client = getElasticsearchClient();

    if (!client) {
      const error = new Error('Elasticsearch client is unavailable for deletion');
      logger.warn({
        service: 'indexing',
        event: 'delete_note_skipped_no_client',
        noteId,
        userId,
        error,
      });
      throw error;
    }

    try {
      await client.delete({
        index: NOTES_INDEX,
        id: noteId,
      }).catch(() => {});

      await client.deleteByQuery({
        index: CHUNKS_INDEX,
        query: {
          term: { note_id: noteId },
        },
        refresh: false,
      }).catch(() => {});

      logger.info({
        service: 'indexing',
        event: 'note_and_chunks_deleted_from_index',
        noteId,
        userId,
        durationMs: Date.now() - startTime,
      });
    } catch (error: any) {
      if (
        error?.meta?.statusCode === 404 ||
        error?.statusCode === 404 ||
        error?.message?.includes('not_found')
      ) {
        return;
      }

      logger.error({
        service: 'indexing',
        event: 'delete_note_failed',
        noteId,
        userId,
        durationMs: Date.now() - startTime,
        error,
      });
      throw error;
    }
  }
}

export const indexingService = new IndexingService();

// Standalone function exports matching requested interface
export const indexNote = (note: NoteInputForIndexing) => indexingService.indexNote(note);
export const updateNote = (note: NoteInputForIndexing) => indexingService.updateNote(note);
export const deleteNote = (noteId: string, userId?: string) => indexingService.deleteNote(noteId, userId);
