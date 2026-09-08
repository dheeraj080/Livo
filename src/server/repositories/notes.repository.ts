import { eq, and, desc, sql, isNull, isNotNull, inArray } from 'drizzle-orm';
import { getDatabase } from '../services/db';
import {
  notes,
  noteTags,
  tags,
  notebooks,
  attachments,
  noteVersions,
  type NoteRow,
  type TagRow,
  type AttachmentRow,
  type NoteVersionRow,
} from '../services/db/schema';
import { tagsRepository } from './tags.repository';
import { notebooksRepository } from './notebooks.repository';

export interface NoteDetail extends NoteRow {
  tags: TagRow[];
  attachments?: AttachmentRow[];
  notebookName?: string;
}

export interface CreateNoteInput {
  title?: string;
  contentJson?: Record<string, any>;
  contentText?: string;
  notebookId?: string | null;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  contentJson?: Record<string, any>;
  contentText?: string;
  notebookId?: string | null;
  tagIds?: string[];
}

export interface ListNotesOptions {
  notebookId?: string;
  tagId?: string;
  isTrashed?: boolean;
  limit?: number;
  offset?: number;
}

// In-memory notes fallback store when PostgreSQL is unconfigured or unavailable
const inMemoryNotes = new Map<string, NoteDetail>([
  [
    'note-welcome-01',
    {
      id: 'note-welcome-01',
      userId: '00000000-0000-0000-0000-000000000001',
      notebookId: 'nb-primary',
      notebookName: 'Personal Brain',
      title: 'Welcome to livo Knowledge Base',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to livo' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'livo is your personal AI-powered knowledge management engine inspired by Evernote and Notion.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: "What's under the hood" }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'PostgreSQL + Drizzle ORM: Relational storage' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Elasticsearch: Full-text BM25 indexation' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Google Gemini AI: Server-side summarization' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      contentText:
        'Welcome to livo. livo is your personal AI-powered knowledge management engine inspired by Evernote and Notion.',
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      tags: [
        {
          id: 'tag-1',
          userId: '00000000-0000-0000-0000-000000000001',
          name: 'GettingStarted',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      attachments: [],
    },
  ],
]);

const inMemoryVersions: NoteVersionRow[] = [];

export class NotesRepository {
  /**
   * Helper to ensure content_json is always a valid structured Tiptap JSON object.
   */
  private normalizeContentJson(contentJson?: any, fallbackText?: string): Record<string, any> {
    if (contentJson && typeof contentJson === 'object') {
      return contentJson;
    }
    if (typeof contentJson === 'string') {
      try {
        const parsed = JSON.parse(contentJson);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {
        // Fall through
      }
    }

    const text = fallbackText || (typeof contentJson === 'string' ? contentJson : '');
    return {
      type: 'doc',
      content: text
        ? [
            {
              type: 'paragraph',
              content: [{ type: 'text', text }],
            },
          ]
        : [],
    };
  }

  /**
   * Create a new note.
   * Enforces user_id, stores canonical Tiptap JSON in content_json, normalized plain text in content_text.
   * Also creates the initial note_versions snapshot.
   */
  async create(userId: string, input: CreateNoteInput): Promise<NoteDetail> {
    const db = getDatabase();

    // If notebookId provided, verify it belongs to user
    let notebookName: string | undefined;
    if (input.notebookId) {
      const nb = await notebooksRepository.findById(userId, input.notebookId);
      if (!nb) {
        throw new Error('Notebook not found or does not belong to user');
      }
      notebookName = nb.name;
    }

    const contentJson = this.normalizeContentJson(input.contentJson, input.contentText);
    const contentText = input.contentText !== undefined ? input.contentText : '';
    const title = (input.title || 'Untitled Note').trim();

    if (!db) {
      const noteId = `note-${crypto.randomUUID().slice(0, 8)}`;
      let attachedTags: TagRow[] = [];
      if (input.tagIds && input.tagIds.length > 0) {
        attachedTags = await tagsRepository.setTagsForNote(userId, noteId, input.tagIds);
      }

      const noteDetail: NoteDetail = {
        id: noteId,
        userId,
        notebookId: input.notebookId || null,
        notebookName,
        title,
        contentJson,
        contentText,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: attachedTags,
        attachments: [],
      };

      inMemoryNotes.set(noteId, noteDetail);
      inMemoryVersions.push({
        id: `ver-${crypto.randomUUID().slice(0, 8)}`,
        noteId,
        contentJson,
        contentText,
        createdAt: new Date(),
      });

      return noteDetail;
    }

    try {
      const [createdNote] = await db
        .insert(notes)
        .values({
          userId,
          notebookId: input.notebookId || null,
          title,
          contentJson,
          contentText,
        })
        .returning();

      // Create initial immutable version snapshot
      await db.insert(noteVersions).values({
        noteId: createdNote.id,
        contentJson,
        contentText,
      });

      // Attach initial tags if provided
      let attachedTags: TagRow[] = [];
      if (input.tagIds && input.tagIds.length > 0) {
        attachedTags = await tagsRepository.setTagsForNote(userId, createdNote.id, input.tagIds);
      }

      const result: NoteDetail = {
        ...createdNote,
        notebookName,
        tags: attachedTags,
        attachments: [],
      };

      inMemoryNotes.set(createdNote.id, result);
      return result;
    } catch {
      const noteId = `note-${crypto.randomUUID().slice(0, 8)}`;
      let attachedTags: TagRow[] = [];
      if (input.tagIds && input.tagIds.length > 0) {
        attachedTags = await tagsRepository.setTagsForNote(userId, noteId, input.tagIds);
      }

      const noteDetail: NoteDetail = {
        id: noteId,
        userId,
        notebookId: input.notebookId || null,
        notebookName,
        title,
        contentJson,
        contentText,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: attachedTags,
        attachments: [],
      };

      inMemoryNotes.set(noteId, noteDetail);
      return noteDetail;
    }
  }

  /**
   * Get a note by ID with ownership verification.
   * Never returns a note belonging to another user.
   */
  async findById(
    userId: string,
    id: string,
    options?: { includeDeleted?: boolean }
  ): Promise<NoteDetail | null> {
    const db = getDatabase();
    if (!db) {
      const note = inMemoryNotes.get(id);
      if (!note || note.userId !== userId) return null;
      if (!options?.includeDeleted && note.deletedAt) return null;
      return note;
    }

    try {
      const conditions = [eq(notes.id, id), eq(notes.userId, userId)];
      if (!options?.includeDeleted) {
        conditions.push(isNull(notes.deletedAt));
      }

      const [note] = await db
        .select({
          id: notes.id,
          userId: notes.userId,
          notebookId: notes.notebookId,
          title: notes.title,
          contentJson: notes.contentJson,
          contentText: notes.contentText,
          createdAt: notes.createdAt,
          updatedAt: notes.updatedAt,
          deletedAt: notes.deletedAt,
          notebookName: notebooks.name,
        })
        .from(notes)
        .leftJoin(notebooks, eq(notebooks.id, notes.notebookId))
        .where(and(...conditions))
        .limit(1);

      if (!note) {
        const memoryNote = inMemoryNotes.get(id);
        if (memoryNote && memoryNote.userId === userId) {
          if (!options?.includeDeleted && memoryNote.deletedAt) return null;
          return memoryNote;
        }
        return null;
      }

      // Fetch tags for this note
      const noteTagsList = await tagsRepository.getTagsForNote(userId, note.id);

      // Fetch attachment metadata
      const attachmentsList = await db
        .select()
        .from(attachments)
        .where(and(eq(attachments.noteId, note.id), eq(attachments.userId, userId)));

      return {
        ...note,
        notebookName: note.notebookName || undefined,
        tags: noteTagsList,
        attachments: attachmentsList,
      };
    } catch {
      const memoryNote = inMemoryNotes.get(id);
      if (memoryNote && memoryNote.userId === userId) {
        if (!options?.includeDeleted && memoryNote.deletedAt) return null;
        return memoryNote;
      }
      return null;
    }
  }

  /**
   * Update a note.
   * Verifies user_id ownership, updates content_json, content_text, title, etc.,
   * and creates a version snapshot when content changes.
   */
  async update(userId: string, id: string, input: UpdateNoteInput): Promise<NoteDetail | null> {
    const existing = await this.findById(userId, id, { includeDeleted: true });
    if (!existing) {
      return null;
    }

    // Verify notebook ownership if moving
    if (input.notebookId !== undefined && input.notebookId !== null) {
      const nb = await notebooksRepository.findById(userId, input.notebookId);
      if (!nb) {
        throw new Error('Target notebook not found or does not belong to user');
      }
    }

    let shouldCreateVersion = false;
    let newContentJson = existing.contentJson;
    let newContentText = existing.contentText;

    if (input.contentJson !== undefined) {
      newContentJson = this.normalizeContentJson(input.contentJson, input.contentText);
      shouldCreateVersion = true;
    }

    if (input.contentText !== undefined) {
      newContentText = input.contentText;
      shouldCreateVersion = true;
    }

    const db = getDatabase();
    if (!db) {
      let updatedTags = existing.tags;
      if (input.tagIds !== undefined) {
        updatedTags = await tagsRepository.setTagsForNote(userId, id, input.tagIds);
      }

      const updated: NoteDetail = {
        ...existing,
        title: input.title !== undefined ? input.title.trim() : existing.title,
        notebookId: input.notebookId !== undefined ? input.notebookId : existing.notebookId,
        contentJson: newContentJson,
        contentText: newContentText,
        tags: updatedTags,
        updatedAt: new Date(),
      };

      inMemoryNotes.set(id, updated);
      if (shouldCreateVersion) {
        inMemoryVersions.push({
          id: `ver-${crypto.randomUUID().slice(0, 8)}`,
          noteId: id,
          contentJson: newContentJson,
          contentText: newContentText,
          createdAt: new Date(),
        });
      }

      return updated;
    }

    try {
      const updateFields: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (input.title !== undefined) {
        updateFields.title = input.title.trim();
      }
      if (input.notebookId !== undefined) {
        updateFields.notebookId = input.notebookId;
      }
      if (input.contentJson !== undefined) {
        updateFields.contentJson = newContentJson;
      }
      if (input.contentText !== undefined) {
        updateFields.contentText = newContentText;
      }

      const [updated] = await db
        .update(notes)
        .set(updateFields)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)))
        .returning();

      if (!updated) return null;

      if (shouldCreateVersion) {
        await db.insert(noteVersions).values({
          noteId: id,
          contentJson: newContentJson,
          contentText: newContentText,
        });
      }

      let updatedTags = existing.tags;
      if (input.tagIds !== undefined) {
        updatedTags = await tagsRepository.setTagsForNote(userId, id, input.tagIds);
      }

      const result: NoteDetail = {
        ...updated,
        tags: updatedTags,
        attachments: existing.attachments,
      };

      inMemoryNotes.set(id, result);
      return result;
    } catch {
      let updatedTags = existing.tags;
      if (input.tagIds !== undefined) {
        updatedTags = await tagsRepository.setTagsForNote(userId, id, input.tagIds);
      }

      const updated: NoteDetail = {
        ...existing,
        title: input.title !== undefined ? input.title.trim() : existing.title,
        notebookId: input.notebookId !== undefined ? input.notebookId : existing.notebookId,
        contentJson: newContentJson,
        contentText: newContentText,
        tags: updatedTags,
        updatedAt: new Date(),
      };

      inMemoryNotes.set(id, updated);
      return updated;
    }
  }

  /**
   * Soft delete a note (sets deleted_at = NOW()).
   * Verifies user_id ownership.
   */
  async softDelete(userId: string, id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      const note = inMemoryNotes.get(id);
      if (note && note.userId === userId) {
        note.deletedAt = new Date();
        note.updatedAt = new Date();
        return true;
      }
      return false;
    }

    try {
      const result = await db
        .update(notes)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(notes.id, id), eq(notes.userId, userId), isNull(notes.deletedAt)))
        .returning({ id: notes.id });

      const note = inMemoryNotes.get(id);
      if (note) {
        note.deletedAt = new Date();
      }

      return result.length > 0;
    } catch {
      const note = inMemoryNotes.get(id);
      if (note && note.userId === userId) {
        note.deletedAt = new Date();
        note.updatedAt = new Date();
        return true;
      }
      return false;
    }
  }

  /**
   * Restore a soft-deleted note (sets deleted_at = NULL).
   */
  async restore(userId: string, id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      const note = inMemoryNotes.get(id);
      if (note && note.userId === userId) {
        note.deletedAt = null;
        note.updatedAt = new Date();
        return true;
      }
      return false;
    }

    try {
      const result = await db
        .update(notes)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(and(eq(notes.id, id), eq(notes.userId, userId), isNotNull(notes.deletedAt)))
        .returning({ id: notes.id });

      const note = inMemoryNotes.get(id);
      if (note) {
        note.deletedAt = null;
      }

      return result.length > 0;
    } catch {
      const note = inMemoryNotes.get(id);
      if (note && note.userId === userId) {
        note.deletedAt = null;
        note.updatedAt = new Date();
        return true;
      }
      return false;
    }
  }

  /**
   * Hard delete a note permanently.
   */
  async hardDelete(userId: string, id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      const note = inMemoryNotes.get(id);
      if (note && note.userId === userId) {
        inMemoryNotes.delete(id);
        return true;
      }
      return false;
    }

    try {
      const result = await db
        .delete(notes)
        .where(and(eq(notes.id, id), eq(notes.userId, userId)))
        .returning({ id: notes.id });

      inMemoryNotes.delete(id);
      return result.length > 0;
    } catch {
      const note = inMemoryNotes.get(id);
      if (note && note.userId === userId) {
        inMemoryNotes.delete(id);
        return true;
      }
      return false;
    }
  }

  /**
   * List notes for a user with filters.
   * Strictly scopes by userId.
   * Default excludes soft-deleted notes unless isTrashed: true.
   */
  async listByUser(userId: string, options?: ListNotesOptions): Promise<NoteDetail[]> {
    const db = getDatabase();
    if (!db) {
      return Array.from(inMemoryNotes.values())
        .filter((n) => {
          if (n.userId !== userId) return false;
          if (options?.isTrashed ? !n.deletedAt : n.deletedAt) return false;
          if (options?.notebookId && n.notebookId !== options.notebookId) return false;
          if (options?.tagId && !n.tags.some((t) => t.id === options.tagId)) return false;
          return true;
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    try {
      const conditions = [eq(notes.userId, userId)];

      if (options?.isTrashed) {
        conditions.push(isNotNull(notes.deletedAt));
      } else {
        conditions.push(isNull(notes.deletedAt));
      }

      if (options?.notebookId) {
        conditions.push(eq(notes.notebookId, options.notebookId));
      }

      let noteIdFilter: string[] | undefined;
      if (options?.tagId) {
        // Find note IDs that have this tag
        const matched = await db
          .select({ noteId: noteTags.noteId })
          .from(noteTags)
          .innerJoin(tags, eq(tags.id, noteTags.tagId))
          .where(and(eq(tags.id, options.tagId), eq(tags.userId, userId)));

        noteIdFilter = matched.map((m) => m.noteId);
        if (noteIdFilter.length === 0) {
          return [];
        }
        conditions.push(inArray(notes.id, noteIdFilter));
      }

      let query = db
        .select({
          id: notes.id,
          userId: notes.userId,
          notebookId: notes.notebookId,
          title: notes.title,
          contentJson: notes.contentJson,
          contentText: notes.contentText,
          createdAt: notes.createdAt,
          updatedAt: notes.updatedAt,
          deletedAt: notes.deletedAt,
          notebookName: notebooks.name,
        })
        .from(notes)
        .leftJoin(notebooks, eq(notebooks.id, notes.notebookId))
        .where(and(...conditions))
        .orderBy(desc(notes.updatedAt));

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }
      if (options?.offset) {
        query = query.offset(options.offset) as any;
      }

      const rows = await query;
      if (rows.length === 0) {
        // Fallback to in-memory if DB is empty/unseeded
        return Array.from(inMemoryNotes.values())
          .filter((n) => {
            if (n.userId !== userId) return false;
            if (options?.isTrashed ? !n.deletedAt : n.deletedAt) return false;
            if (options?.notebookId && n.notebookId !== options.notebookId) return false;
            if (options?.tagId && !n.tags.some((t) => t.id === options.tagId)) return false;
            return true;
          })
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }

      const noteIds = rows.map((r) => r.id);

      // Fetch tags for all retrieved notes in a single batch
      const allNoteTags = await db
        .select({
          noteId: noteTags.noteId,
          id: tags.id,
          userId: tags.userId,
          name: tags.name,
          createdAt: tags.createdAt,
        })
        .from(noteTags)
        .innerJoin(tags, eq(tags.id, noteTags.tagId))
        .where(and(inArray(noteTags.noteId, noteIds), eq(tags.userId, userId)));

      const tagsByNoteId = new Map<string, TagRow[]>();
      for (const t of allNoteTags) {
        const list = tagsByNoteId.get(t.noteId) || [];
        list.push({
          id: t.id,
          userId: t.userId,
          name: t.name,
          createdAt: t.createdAt,
        });
        tagsByNoteId.set(t.noteId, list);
      }

      return rows.map((r) => ({
        ...r,
        notebookName: r.notebookName || undefined,
        tags: tagsByNoteId.get(r.id) || [],
        attachments: [],
      }));
    } catch {
      return Array.from(inMemoryNotes.values())
        .filter((n) => {
          if (n.userId !== userId) return false;
          if (options?.isTrashed ? !n.deletedAt : n.deletedAt) return false;
          if (options?.notebookId && n.notebookId !== options.notebookId) return false;
          if (options?.tagId && !n.tags.some((t) => t.id === options.tagId)) return false;
          return true;
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
  }

  /**
   * Create an explicit immutable version snapshot.
   */
  async createVersion(
    noteId: string,
    contentJson: Record<string, any>,
    contentText: string
  ): Promise<NoteVersionRow> {
    const db = getDatabase();
    if (!db) {
      const ver: NoteVersionRow = {
        id: `ver-${crypto.randomUUID().slice(0, 8)}`,
        noteId,
        contentJson,
        contentText,
        createdAt: new Date(),
      };
      inMemoryVersions.push(ver);
      return ver;
    }

    try {
      const [version] = await db
        .insert(noteVersions)
        .values({
          noteId,
          contentJson,
          contentText,
        })
        .returning();

      return version;
    } catch {
      const ver: NoteVersionRow = {
        id: `ver-${crypto.randomUUID().slice(0, 8)}`,
        noteId,
        contentJson,
        contentText,
        createdAt: new Date(),
      };
      inMemoryVersions.push(ver);
      return ver;
    }
  }

  /**
   * List immutable version snapshots for a note.
   */
  async listVersions(userId: string, noteId: string): Promise<NoteVersionRow[]> {
    const db = getDatabase();
    if (!db) {
      return inMemoryVersions
        .filter((v) => v.noteId === noteId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    try {
      // Verify note ownership
      const note = await this.findById(userId, noteId, { includeDeleted: true });
      if (!note) return [];

      const rows = await db
        .select()
        .from(noteVersions)
        .where(eq(noteVersions.noteId, noteId))
        .orderBy(desc(noteVersions.createdAt));

      return rows;
    } catch {
      return inMemoryVersions
        .filter((v) => v.noteId === noteId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }
}

export const notesRepository = new NotesRepository();
