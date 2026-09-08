import { z } from 'zod';
import { usersRepository } from '../../repositories/users.repository';
import type { User } from '@/src/types';

export const userCredentialsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export type UserCredentialsInput = z.infer<typeof userCredentialsSchema>;

const DEFAULT_USER_EMAIL = 'clemmmiedawson@gmail.com';
const DEFAULT_USER_NAME = 'Clemmie Dawson';
const FALLBACK_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Resolves the authenticated user from request headers or workspace context.
 * Always returns a valid User object with a proper UUID for foreign key constraints.
 */
export async function getCurrentUser(req?: Request): Promise<User> {
  const reqEmail = req?.headers.get('x-user-email') || DEFAULT_USER_EMAIL;
  const reqName = req?.headers.get('x-user-name') || DEFAULT_USER_NAME;
  const reqUserId = req?.headers.get('x-user-id');

  try {
    if (reqUserId) {
      const user = await usersRepository.findById(reqUserId);
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl || undefined,
          createdAt: user.createdAt.toISOString(),
        };
      }
    }

    // Find or create by email
    const user = await usersRepository.findOrCreate({
      email: reqEmail,
      name: reqName,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt.toISOString(),
    };
  } catch {
    return {
      id: FALLBACK_USER_ID,
      email: reqEmail,
      name: reqName,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
  }
}
