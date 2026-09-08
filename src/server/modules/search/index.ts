import { z } from 'zod';
import { searchService, type SearchNotesParams, type SearchNotesResponse } from '../../services/search';

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  notebookId: z.string().optional(),
  tagId: z.string().optional(),
  tagIds: z.array(z.string()).or(z.string()).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'updated_at', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  noteId: z.string().optional(),
  searchMode: z.enum(['keyword', 'semantic', 'hybrid']).optional(),
});

export type SearchNotesApiQuery = z.infer<typeof searchQuerySchema>;

/**
 * High-level search module delegating to SearchService.
 * Strictly enforces user_id scoping for tenant isolation.
 */
export async function searchNotes(params: SearchNotesParams): Promise<SearchNotesResponse> {
  return searchService.searchNotes(params);
}

export * from '../../services/search';
