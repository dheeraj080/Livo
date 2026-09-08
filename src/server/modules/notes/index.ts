import { z } from 'zod';
import { notesRepository, type NoteDetail } from '../../repositories/notes.repository';
import { queueNoteIndexingJob } from '../../services/jobs';
import type { Note, Tag } from '@/src/types';

export const createNoteSchema = z.object({
  title: z.string().min(1).default('Untitled Note'),
  content_json: z.record(z.string(), z.any()).or(z.string()).optional(),
  content_text: z.string().optional(),
  content: z.string().optional(),
  plainText: z.string().optional(),
  notebookId: z.string().min(1).optional().nullable(),
  tagIds: z.array(z.string().min(1)).optional(),
  isPinned: z.boolean().optional().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content_json: z.record(z.string(), z.any()).or(z.string()).optional(),
  content_text: z.string().optional(),
  content: z.string().optional(),
  plainText: z.string().optional(),
  notebookId: z.string().min(1).optional().nullable(),
  tagIds: z.array(z.string().min(1)).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
});

export const listNotesQuerySchema = z.object({
  notebookId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  isTrashed: z.coerce.boolean().optional().default(false),
  isPinned: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;

/**
 * Transforms a database NoteDetail row into the API Note domain representation.
 * Canonical representation is content_json and content_text;
 * content string is provided for client editors that parse HTML/JSON.
 */
function mapNoteDetailToNote(detail: NoteDetail): Note {
  const jsonContent = detail.contentJson as Record<string, any>;
  const serializedContent =
    jsonContent && Object.keys(jsonContent).length > 0
      ? JSON.stringify(jsonContent)
      : detail.contentText || '';

  return {
    id: detail.id,
    userId: detail.userId,
    notebookId: detail.notebookId,
    notebookName: detail.notebookName,
    title: detail.title,
    contentJson: jsonContent,
    contentText: detail.contentText,
    content: serializedContent,
    plainText: detail.contentText,
    tags: detail.tags.map((t) => ({
      id: t.id,
      userId: t.userId,
      name: t.name,
      noteCount: 0,
      createdAt: t.createdAt.toISOString(),
    })),
    attachments: detail.attachments?.map((a) => ({
      id: a.id,
      noteId: a.noteId,
      userId: a.userId,
      storageKey: a.storageKey,
      filename: a.filename,
      mimeType: a.mimeType,
      size: a.size,
      status: (a.status as any) || 'UPLOADED',
      extractedText: a.extractedText || '',
      processingError: a.processingError || null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt ? a.updatedAt.toISOString() : undefined,
    })),
    isPinned: false, // In postgres persistence, pinned can be derived or stored in tags/metadata
    isArchived: false,
    isTrashed: Boolean(detail.deletedAt),
    deletedAt: detail.deletedAt ? detail.deletedAt.toISOString() : null,
    createdAt: detail.createdAt.toISOString(),
    updatedAt: detail.updatedAt.toISOString(),
  };
}

/**
 * Extracts and normalizes contentJson and contentText from the flexible client input.
 */
function extractNoteContent(input: {
  content_json?: Record<string, any> | string;
  content_text?: string;
  content?: string;
  plainText?: string;
}) {
  let contentJson: Record<string, any> | undefined;
  let contentText = input.content_text ?? input.plainText ?? '';

  if (input.content_json) {
    if (typeof input.content_json === 'object') {
      contentJson = input.content_json;
    } else if (typeof input.content_json === 'string') {
      try {
        contentJson = JSON.parse(input.content_json);
      } catch {
        // Fall back to building document from string
      }
    }
  }

  // If no content_json was passed but content string is provided, try parsing as JSON or wrapping
  if (!contentJson && input.content) {
    try {
      const parsed = JSON.parse(input.content);
      if (parsed && typeof parsed === 'object') {
        contentJson = parsed;
      }
    } catch {
      // Content is HTML or plain text string
      if (!contentText) {
        contentText = input.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      contentJson = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: input.content }],
          },
        ],
      };
    }
  }

  return { contentJson, contentText };
}

/**
 * List notes strictly scoped to the authenticated user.
 */
export async function listNotes(userId: string, options?: ListNotesQuery): Promise<Note[]> {
  const details = await notesRepository.listByUser(userId, {
    notebookId: options?.notebookId,
    tagId: options?.tagId,
    isTrashed: options?.isTrashed,
    limit: options?.limit,
    offset: options?.offset,
  });

  return details.map(mapNoteDetailToNote);
}

/**
 * Get a single note by ID. Never returns a note belonging to another user.
 */
export async function getNote(
  userId: string,
  id: string,
  options?: { includeDeleted?: boolean }
): Promise<Note | null> {
  const detail = await notesRepository.findById(userId, id, options);
  if (!detail) return null;
  return mapNoteDetailToNote(detail);
}

/**
 * Create a new note. Stores Tiptap JSON in content_json and plain text in content_text.
 * Dispatches background search indexing.
 */
export async function createNote(userId: string, input: CreateNoteInput): Promise<Note> {
  const { contentJson, contentText } = extractNoteContent(input);

  const detail = await notesRepository.create(userId, {
    title: input.title,
    contentJson,
    contentText,
    notebookId: input.notebookId,
    tagIds: input.tagIds,
  });

  const note = mapNoteDetailToNote(detail);

  // Asynchronous background indexing dispatch via BullMQ
  queueNoteIndexingJob({
    action: 'index',
    noteId: note.id,
    userId,
    notePayload: {
      id: note.id,
      userId,
      title: note.title,
      contentText: note.contentText,
      notebookId: note.notebookId,
      tags: note.tags.map((t) => t.id),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    },
  }).catch(() => {});

  return note;
}

/**
 * Update a note with user ownership verification.
 */
export async function updateNote(
  userId: string,
  id: string,
  input: UpdateNoteInput
): Promise<Note | null> {
  // If soft deletion toggle is requested in update payload
  if (input.isTrashed === true) {
    await notesRepository.softDelete(userId, id);
    queueNoteIndexingJob({
      action: 'delete',
      noteId: id,
      userId,
    }).catch(() => {});
    return getNote(userId, id, { includeDeleted: true });
  } else if (input.isTrashed === false) {
    await notesRepository.restore(userId, id);
    const restored = await getNote(userId, id);
    if (restored) {
      queueNoteIndexingJob({
        action: 'update',
        noteId: id,
        userId,
        notePayload: {
          id: restored.id,
          userId: restored.userId,
          title: restored.title,
          contentText: restored.contentText,
          notebookId: restored.notebookId,
          tags: restored.tags.map((t) => t.id),
          createdAt: restored.createdAt,
          updatedAt: restored.updatedAt,
        },
      }).catch(() => {});
    }
    return restored;
  }

  const { contentJson, contentText } = extractNoteContent(input);

  const detail = await notesRepository.update(userId, id, {
    title: input.title,
    contentJson,
    contentText: contentText || undefined,
    notebookId: input.notebookId,
    tagIds: input.tagIds,
  });

  if (!detail) return null;
  const note = mapNoteDetailToNote(detail);

  // Asynchronous background index update via BullMQ
  queueNoteIndexingJob({
    action: 'update',
    noteId: note.id,
    userId,
    notePayload: {
      id: note.id,
      userId,
      title: note.title,
      contentText: note.contentText,
      notebookId: note.notebookId,
      tags: note.tags.map((t) => t.id),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    },
  }).catch(() => {});

  return note;
}

/**
 * Soft delete a note (sets deleted_at = NOW()).
 * Removes the note from the active search index via BullMQ job.
 */
export async function deleteNote(userId: string, id: string): Promise<boolean> {
  const success = await notesRepository.softDelete(userId, id);
  if (success) {
    queueNoteIndexingJob({
      action: 'delete',
      noteId: id,
      userId,
    }).catch(() => {});
  }
  return success;
}
