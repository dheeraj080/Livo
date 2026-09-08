import { z } from 'zod';
import { notebooksRepository, type NotebookWithStats } from '../../repositories/notebooks.repository';
import { notesRepository } from '../../repositories/notes.repository';
import type { Notebook } from '@/src/types';

export const createNotebookSchema = z.object({
  name: z.string().min(1, 'Notebook name is required').max(100),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional().default('#4f46e5'),
  icon: z.string().optional().default('notebook'),
});

export const updateNotebookSchema = z.object({
  name: z.string().min(1, 'Notebook name cannot be empty').max(100).optional(),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
  icon: z.string().optional(),
});

export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type UpdateNotebookInput = z.infer<typeof updateNotebookSchema>;

function mapNotebookToDomain(row: NotebookWithStats, extra?: { description?: string; color?: string; icon?: string }): Notebook {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    parentId: row.parentId,
    description: extra?.description,
    color: extra?.color || '#4f46e5',
    icon: extra?.icon || 'notebook',
    noteCount: row.noteCount || 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listNotebooks(userId: string): Promise<Notebook[]> {
  const rows = await notebooksRepository.listByUser(userId);
  return rows.map((r) => mapNotebookToDomain(r));
}

export async function getNotebook(userId: string, id: string): Promise<Notebook | null> {
  const row = await notebooksRepository.findById(userId, id);
  if (!row) return null;
  return mapNotebookToDomain({ ...row, noteCount: 0 });
}

export async function createNotebook(
  userId: string,
  input: CreateNotebookInput
): Promise<Notebook> {
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('Notebook name cannot be empty.');
  }

  const existing = await notebooksRepository.findByName(userId, trimmedName);
  if (existing) {
    throw new Error(`A notebook named "${trimmedName}" already exists.`);
  }

  const created = await notebooksRepository.create(userId, {
    name: trimmedName,
    parentId: input.parentId,
  });

  return mapNotebookToDomain(
    { ...created, noteCount: 0 },
    { description: input.description, color: input.color, icon: input.icon }
  );
}

export async function updateNotebook(
  userId: string,
  id: string,
  input: UpdateNotebookInput
): Promise<Notebook | null> {
  let trimmedName: string | undefined = undefined;
  if (input.name !== undefined) {
    trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error('Notebook name cannot be empty.');
    }

    const existing = await notebooksRepository.findByName(userId, trimmedName);
    if (existing && existing.id !== id) {
      throw new Error(`A notebook named "${trimmedName}" already exists.`);
    }
  }

  const updated = await notebooksRepository.update(userId, id, {
    name: trimmedName,
    parentId: input.parentId,
  });

  if (!updated) return null;
  return mapNotebookToDomain(
    { ...updated, noteCount: 0 },
    { description: input.description, color: input.color, icon: input.icon }
  );
}

export async function deleteNotebook(userId: string, id: string): Promise<boolean> {
  // First safely unassign any notes belonging to this notebook so they remain in "All Notes"
  await notesRepository.unassignNotebook(userId, id);
  return notebooksRepository.delete(userId, id);
}
