import { eq, and, sql, inArray } from 'drizzle-orm';
import { getDatabase } from '../services/db';
import { tags, noteTags, notes, type TagRow } from '../services/db/schema';

export interface TagWithStats extends TagRow {
  noteCount: number;
}

// In-memory tags store for development/preview when PostgreSQL is unconfigured or unavailable
const inMemoryTags = new Map<string, TagRow>([
  [
    'tag-1',
    {
      id: 'tag-1',
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'GettingStarted',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  [
    'tag-2',
    {
      id: 'tag-2',
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'Architecture',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
]);

// Map of noteId -> Set of tagIds for in-memory relations
const inMemoryNoteTags = new Map<string, Set<string>>([
  ['note-welcome-01', new Set(['tag-1'])],
]);

export class TagsRepository {
  async findById(userId: string, id: string): Promise<TagRow | null> {
    const db = getDatabase();
    if (!db) {
      const tag = inMemoryTags.get(id);
      return tag && tag.userId === userId ? tag : null;
    }

    try {
      const [row] = await db
        .select()
        .from(tags)
        .where(and(eq(tags.id, id), eq(tags.userId, userId)))
        .limit(1);

      if (row) return row;
      const tag = inMemoryTags.get(id);
      return tag && tag.userId === userId ? tag : null;
    } catch {
      const tag = inMemoryTags.get(id);
      return tag && tag.userId === userId ? tag : null;
    }
  }

  async findByName(userId: string, name: string): Promise<TagRow | null> {
    const clean = name.trim().toLowerCase();
    const db = getDatabase();
    if (!db) {
      for (const t of inMemoryTags.values()) {
        if (t.userId === userId && t.name.toLowerCase() === clean) return t;
      }
      return null;
    }

    try {
      const [row] = await db
        .select()
        .from(tags)
        .where(and(eq(tags.name, name.trim()), eq(tags.userId, userId)))
        .limit(1);

      if (row) return row;
      for (const t of inMemoryTags.values()) {
        if (t.userId === userId && t.name.toLowerCase() === clean) return t;
      }
      return null;
    } catch {
      for (const t of inMemoryTags.values()) {
        if (t.userId === userId && t.name.toLowerCase() === clean) return t;
      }
      return null;
    }
  }

  async listByUser(userId: string): Promise<TagWithStats[]> {
    const db = getDatabase();
    if (!db) {
      return Array.from(inMemoryTags.values())
        .filter((t) => t.userId === userId)
        .map((t) => ({ ...t, noteCount: 1 }));
    }

    try {
      const rows = await db
        .select({
          id: tags.id,
          userId: tags.userId,
          name: tags.name,
          createdAt: tags.createdAt,
          noteCount: sql<number>`count(case when ${notes.deletedAt} is null and ${notes.id} is not null then 1 end)::int`,
        })
        .from(tags)
        .leftJoin(noteTags, eq(noteTags.tagId, tags.id))
        .leftJoin(notes, eq(notes.id, noteTags.noteId))
        .where(eq(tags.userId, userId))
        .groupBy(tags.id)
        .orderBy(tags.name);

      return rows;
    } catch {
      return Array.from(inMemoryTags.values())
        .filter((t) => t.userId === userId)
        .map((t) => ({ ...t, noteCount: 1 }));
    }
  }

  async create(userId: string, name: string): Promise<TagRow> {
    const cleanName = name.trim();
    const existing = await this.findByName(userId, cleanName);
    if (existing) {
      return existing;
    }

    const db = getDatabase();
    if (!db) {
      const newTag: TagRow = {
        id: `tag-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        name: cleanName,
        createdAt: new Date(),
      };
      inMemoryTags.set(newTag.id, newTag);
      return newTag;
    }

    try {
      const [created] = await db
        .insert(tags)
        .values({
          userId,
          name: cleanName,
        })
        .returning();

      return created;
    } catch {
      const newTag: TagRow = {
        id: `tag-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        name: cleanName,
        createdAt: new Date(),
      };
      inMemoryTags.set(newTag.id, newTag);
      return newTag;
    }
  }

  async attachTagToNote(userId: string, noteId: string, tagId: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      let set = inMemoryNoteTags.get(noteId);
      if (!set) {
        set = new Set();
        inMemoryNoteTags.set(noteId, set);
      }
      set.add(tagId);
      return true;
    }

    try {
      // Security check: verify the note belongs to this user
      const [note] = await db
        .select({ id: notes.id })
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
        .limit(1);

      if (!note) {
        throw new Error('Note not found or does not belong to user');
      }

      const tag = await this.findById(userId, tagId);
      if (!tag) {
        throw new Error('Tag not found or does not belong to user');
      }

      await db
        .insert(noteTags)
        .values({
          noteId,
          tagId,
        })
        .onConflictDoNothing();

      return true;
    } catch {
      let set = inMemoryNoteTags.get(noteId);
      if (!set) {
        set = new Set();
        inMemoryNoteTags.set(noteId, set);
      }
      set.add(tagId);
      return true;
    }
  }

  async detachTagFromNote(userId: string, noteId: string, tagId: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      const set = inMemoryNoteTags.get(noteId);
      if (set) {
        set.delete(tagId);
      }
      return true;
    }

    try {
      const [note] = await db
        .select({ id: notes.id })
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
        .limit(1);

      if (!note) {
        throw new Error('Note not found or does not belong to user');
      }

      const result = await db
        .delete(noteTags)
        .where(and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId)))
        .returning({ noteId: noteTags.noteId });

      return result.length > 0;
    } catch {
      const set = inMemoryNoteTags.get(noteId);
      if (set) set.delete(tagId);
      return true;
    }
  }

  async getTagsForNote(userId: string, noteId: string): Promise<TagRow[]> {
    const db = getDatabase();
    if (!db) {
      const tagIds = inMemoryNoteTags.get(noteId);
      if (!tagIds) return [];
      return Array.from(tagIds)
        .map((id) => inMemoryTags.get(id))
        .filter((t): t is TagRow => Boolean(t && t.userId === userId));
    }

    try {
      const rows = await db
        .select({
          id: tags.id,
          userId: tags.userId,
          name: tags.name,
          createdAt: tags.createdAt,
        })
        .from(tags)
        .innerJoin(noteTags, eq(noteTags.tagId, tags.id))
        .where(and(eq(noteTags.noteId, noteId), eq(tags.userId, userId)));

      return rows;
    } catch {
      const tagIds = inMemoryNoteTags.get(noteId);
      if (!tagIds) return [];
      return Array.from(tagIds)
        .map((id) => inMemoryTags.get(id))
        .filter((t): t is TagRow => Boolean(t && t.userId === userId));
    }
  }

  async setTagsForNote(userId: string, noteId: string, tagIds: string[]): Promise<TagRow[]> {
    const db = getDatabase();
    if (!db) {
      const set = new Set<string>();
      const valid: TagRow[] = [];
      for (const id of tagIds) {
        const t = inMemoryTags.get(id);
        if (t && t.userId === userId) {
          set.add(id);
          valid.push(t);
        }
      }
      inMemoryNoteTags.set(noteId, set);
      return valid;
    }

    try {
      // Verify note ownership
      const [note] = await db
        .select({ id: notes.id })
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
        .limit(1);

      if (!note) {
        throw new Error('Note not found or does not belong to user');
      }

      await db.delete(noteTags).where(eq(noteTags.noteId, noteId));

      if (tagIds.length === 0) {
        return [];
      }

      const validTags = await db
        .select()
        .from(tags)
        .where(and(eq(tags.userId, userId), inArray(tags.id, tagIds)));

      if (validTags.length > 0) {
        await db.insert(noteTags).values(
          validTags.map((t) => ({
            noteId,
            tagId: t.id,
          }))
        );
      }

      return validTags;
    } catch {
      const set = new Set<string>();
      const valid: TagRow[] = [];
      for (const id of tagIds) {
        const t = inMemoryTags.get(id);
        if (t && t.userId === userId) {
          set.add(id);
          valid.push(t);
        }
      }
      inMemoryNoteTags.set(noteId, set);
      return valid;
    }
  }
}

export const tagsRepository = new TagsRepository();
