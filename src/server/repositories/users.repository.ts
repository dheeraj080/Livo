import { eq } from 'drizzle-orm';
import { getDatabase } from '../services/db';
import { users, type UserRow } from '../services/db/schema';

// In-memory user fallback store when PostgreSQL is unconfigured or unavailable
const inMemoryUsers = new Map<string, UserRow>([
  [
    '00000000-0000-0000-0000-000000000001',
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'clemmmiedawson@gmail.com',
      name: 'Clemmie Dawson',
      avatarUrl: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
]);

export class UsersRepository {
  async findById(id: string): Promise<UserRow | null> {
    const db = getDatabase();
    if (!db) {
      return inMemoryUsers.get(id) || null;
    }

    try {
      const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return row || inMemoryUsers.get(id) || null;
    } catch {
      return inMemoryUsers.get(id) || null;
    }
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const normalized = email.toLowerCase().trim();
    const db = getDatabase();
    if (!db) {
      for (const u of inMemoryUsers.values()) {
        if (u.email.toLowerCase().trim() === normalized) return u;
      }
      return null;
    }

    try {
      const [row] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
      if (row) return row;
      for (const u of inMemoryUsers.values()) {
        if (u.email.toLowerCase().trim() === normalized) return u;
      }
      return null;
    } catch {
      for (const u of inMemoryUsers.values()) {
        if (u.email.toLowerCase().trim() === normalized) return u;
      }
      return null;
    }
  }

  async create(data: { email: string; name: string; avatarUrl?: string }): Promise<UserRow> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const trimmedName = data.name.trim();

    const db = getDatabase();
    if (!db) {
      const newRow: UserRow = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: trimmedName,
        avatarUrl: data.avatarUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsers.set(newRow.id, newRow);
      return newRow;
    }

    try {
      const [created] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          name: trimmedName,
          avatarUrl: data.avatarUrl,
        })
        .returning();

      return created;
    } catch {
      const newRow: UserRow = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: trimmedName,
        avatarUrl: data.avatarUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryUsers.set(newRow.id, newRow);
      return newRow;
    }
  }

  async findOrCreate(data: { email: string; name: string; avatarUrl?: string }): Promise<UserRow> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      return existing;
    }
    return this.create(data);
  }
}

export const usersRepository = new UsersRepository();
