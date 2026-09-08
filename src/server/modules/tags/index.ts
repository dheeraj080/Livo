import { z } from 'zod';
import { tagsRepository, type TagWithStats } from '../../repositories/tags.repository';
import type { Tag } from '@/src/types';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional().default('#6b7280'),
});

export const attachTagSchema = z.object({
  tagId: z.string().uuid('Invalid tag ID format'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type AttachTagInput = z.infer<typeof attachTagSchema>;

function mapTagToDomain(row: TagWithStats, color?: string): Tag {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    color: color || '#6b7280',
    noteCount: row.noteCount || 0,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listTags(userId: string): Promise<Tag[]> {
  const rows = await tagsRepository.listByUser(userId);
  return rows.map((r) => mapTagToDomain(r));
}

export async function createTag(userId: string, input: CreateTagInput): Promise<Tag> {
  const created = await tagsRepository.create(userId, input.name);
  return mapTagToDomain({ ...created, noteCount: 0 }, input.color);
}

export async function attachTagToNote(
  userId: string,
  noteId: string,
  tagId: string
): Promise<boolean> {
  return tagsRepository.attachTagToNote(userId, noteId, tagId);
}

export async function detachTagFromNote(
  userId: string,
  noteId: string,
  tagId: string
): Promise<boolean> {
  return tagsRepository.detachTagFromNote(userId, noteId, tagId);
}

export async function getTagsForNote(userId: string, noteId: string): Promise<Tag[]> {
  const rows = await tagsRepository.getTagsForNote(userId, noteId);
  return rows.map((r) => mapTagToDomain({ ...r, noteCount: 0 }));
}

export async function setTagsForNote(
  userId: string,
  noteId: string,
  tagIds: string[]
): Promise<Tag[]> {
  const rows = await tagsRepository.setTagsForNote(userId, noteId, tagIds);
  return rows.map((r) => mapTagToDomain({ ...r, noteCount: 0 }));
}

