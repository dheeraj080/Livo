import { eq, and, desc, sql } from 'drizzle-orm';
import { getDatabase } from '../services/db';
import { notebooks, notes, type NotebookRow } from '../services/db/schema';

export interface NotebookWithStats extends NotebookRow {
  noteCount: number;
}

// In-memory notebooks store for development/preview when PostgreSQL is unconfigured or unavailable
const inMemoryNotebooks = new Map<string, NotebookRow>([
  [
    'nb-primary',
    {
      id: 'nb-primary',
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'Personal Brain',
      parentId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
]);

export class NotebooksRepository {
  async findById(userId: string, id: string): Promise<NotebookRow | null> {
    const db = getDatabase();
    if (!db) {
      const nb = inMemoryNotebooks.get(id);
      return nb && nb.userId === userId ? nb : null;
    }

    try {
      const [row] = await db
        .select()
        .from(notebooks)
        .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
        .limit(1);

      if (row) return row;
      const nb = inMemoryNotebooks.get(id);
      return nb && nb.userId === userId ? nb : null;
    } catch {
      const nb = inMemoryNotebooks.get(id);
      return nb && nb.userId === userId ? nb : null;
    }
  }

  async listByUser(userId: string): Promise<NotebookWithStats[]> {
    const db = getDatabase();
    if (!db) {
      return Array.from(inMemoryNotebooks.values())
        .filter((n) => n.userId === userId)
        .map((n) => ({ ...n, noteCount: 1 }));
    }

    try {
      // Left join notes to compute note count for non-deleted notes
      const rows = await db
        .select({
          id: notebooks.id,
          userId: notebooks.userId,
          name: notebooks.name,
          parentId: notebooks.parentId,
          createdAt: notebooks.createdAt,
          updatedAt: notebooks.updatedAt,
          noteCount: sql<number>`count(case when ${notes.deletedAt} is null and ${notes.id} is not null then 1 end)::int`,
        })
        .from(notebooks)
        .leftJoin(notes, eq(notes.notebookId, notebooks.id))
        .where(eq(notebooks.userId, userId))
        .groupBy(notebooks.id)
        .orderBy(desc(notebooks.updatedAt));

      return rows;
    } catch {
      return Array.from(inMemoryNotebooks.values())
        .filter((n) => n.userId === userId)
        .map((n) => ({ ...n, noteCount: 1 }));
    }
  }

  async create(
    userId: string,
    data: { name: string; parentId?: string | null }
  ): Promise<NotebookRow> {
    const db = getDatabase();

    // If parentId is provided, verify parent notebook belongs to the same user
    if (data.parentId) {
      const parent = await this.findById(userId, data.parentId);
      if (!parent) {
        throw new Error('Parent notebook does not exist or does not belong to user');
      }
    }

    if (!db) {
      const newRow: NotebookRow = {
        id: `nb-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        name: data.name.trim(),
        parentId: data.parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryNotebooks.set(newRow.id, newRow);
      return newRow;
    }

    try {
      const [created] = await db
        .insert(notebooks)
        .values({
          userId,
          name: data.name.trim(),
          parentId: data.parentId || null,
        })
        .returning();

      return created;
    } catch {
      const newRow: NotebookRow = {
        id: `nb-${crypto.randomUUID().slice(0, 8)}`,
        userId,
        name: data.name.trim(),
        parentId: data.parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryNotebooks.set(newRow.id, newRow);
      return newRow;
    }
  }

  async update(
    userId: string,
    id: string,
    data: { name?: string; parentId?: string | null }
  ): Promise<NotebookRow | null> {
    const db = getDatabase();

    // Verify ownership
    const existing = await this.findById(userId, id);
    if (!existing) {
      return null;
    }

    // Verify parent notebook belongs to the same user if changed
    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === id) {
        throw new Error('A notebook cannot be its own parent');
      }
      const parent = await this.findById(userId, data.parentId);
      if (!parent) {
        throw new Error('Parent notebook does not exist or does not belong to user');
      }
    }

    if (!db) {
      const current = inMemoryNotebooks.get(id) || existing;
      const updated: NotebookRow = {
        ...current,
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        updatedAt: new Date(),
      };
      inMemoryNotebooks.set(id, updated);
      return updated;
    }

    try {
      const [updated] = await db
        .update(notebooks)
        .set({
          ...(data.name !== undefined ? { name: data.name.trim() } : {}),
          ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
        .returning();

      return updated || null;
    } catch {
      const current = inMemoryNotebooks.get(id) || existing;
      const updated: NotebookRow = {
        ...current,
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        updatedAt: new Date(),
      };
      inMemoryNotebooks.set(id, updated);
      return updated;
    }
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      const existing = inMemoryNotebooks.get(id);
      if (existing && existing.userId === userId) {
        inMemoryNotebooks.delete(id);
        return true;
      }
      return false;
    }

    try {
      const result = await db
        .delete(notebooks)
        .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
        .returning({ id: notebooks.id });

      inMemoryNotebooks.delete(id);
      return result.length > 0;
    } catch {
      const existing = inMemoryNotebooks.get(id);
      if (existing && existing.userId === userId) {
        inMemoryNotebooks.delete(id);
        return true;
      }
      return false;
    }
  }
}

export const notebooksRepository = new NotebooksRepository();
