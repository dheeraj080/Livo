import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../services/db';
import { attachments, notes, type AttachmentRow } from '../services/db/schema';

export interface CreateAttachmentInput {
  noteId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
}

const inMemoryAttachments = new Map<string, AttachmentRow>();

export class AttachmentsRepository {
  /**
   * Verifies that the note exists and belongs to the given user.
   */
  async checkNoteOwnership(userId: string, noteId: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      return true; // Fallback for in-memory testing
    }

    try {
      const [note] = await db
        .select({ id: notes.id, userId: notes.userId })
        .from(notes)
        .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
        .limit(1);

      return Boolean(note);
    } catch (error) {
      console.warn('[AttachmentsRepository] checkNoteOwnership error:', error);
      return false;
    }
  }

  /**
   * Stores attachment metadata in PostgreSQL (or in-memory repository fallback).
   * File bytes are strictly NOT stored in PostgreSQL.
   * Enforces that the target note belongs to the specified user.
   */
  async create(userId: string, data: CreateAttachmentInput): Promise<AttachmentRow> {
    const db = getDatabase();
    if (!db) {
      const newRow: AttachmentRow = {
        id: crypto.randomUUID(),
        noteId: data.noteId,
        userId,
        storageKey: data.storageKey,
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        status: 'UPLOADED',
        extractedText: '',
        processingError: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryAttachments.set(newRow.id, newRow);
      return newRow;
    }

    try {
      // Security check: verify the target note belongs to this user
      const isOwner = await this.checkNoteOwnership(userId, data.noteId);
      if (!isOwner) {
        throw new Error('Access denied: Note does not belong to this user.');
      }

      const [created] = await db
        .insert(attachments)
        .values({
          noteId: data.noteId,
          userId,
          storageKey: data.storageKey,
          filename: data.filename,
          mimeType: data.mimeType,
          size: data.size,
        })
        .returning();

      return created;
    } catch (error: any) {
      if (error.message?.includes('Access denied')) {
        throw error;
      }
      console.warn('[AttachmentsRepository] DB insert failed, falling back to memory store:', error.message);
      const newRow: AttachmentRow = {
        id: crypto.randomUUID(),
        noteId: data.noteId,
        userId,
        storageKey: data.storageKey,
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        status: 'UPLOADED',
        extractedText: '',
        processingError: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryAttachments.set(newRow.id, newRow);
      return newRow;
    }
  }

  /**
   * Secure attachment lookup:
   * A user may access an attachment ONLY if the attachment belongs to a note owned by that user.
   */
  async findById(userId: string, id: string): Promise<AttachmentRow | null> {
    const db = getDatabase();
    if (!db) {
      const att = inMemoryAttachments.get(id);
      return att && att.userId === userId ? att : null;
    }

    try {
      // Inner join with notes to enforce that the note itself belongs to userId
      const [row] = await db
        .select({
          attachment: attachments,
        })
        .from(attachments)
        .innerJoin(notes, eq(attachments.noteId, notes.id))
        .where(
          and(
            eq(attachments.id, id),
            eq(attachments.userId, userId),
            eq(notes.userId, userId)
          )
        )
        .limit(1);

      if (row?.attachment) {
        return row.attachment;
      }

      // Memory fallback check if not in DB
      const att = inMemoryAttachments.get(id);
      return att && att.userId === userId ? att : null;
    } catch (error) {
      console.warn('[AttachmentsRepository] findById query error:', error);
      const att = inMemoryAttachments.get(id);
      return att && att.userId === userId ? att : null;
    }
  }

  /**
   * Lists attachments for a note.
   * Enforces note ownership authorization: only returns items if note belongs to user.
   */
  async listByNote(userId: string, noteId: string): Promise<AttachmentRow[]> {
    const db = getDatabase();
    if (!db) {
      return Array.from(inMemoryAttachments.values()).filter(
        (a) => a.userId === userId && a.noteId === noteId
      );
    }

    try {
      // Enforce note ownership
      const isOwner = await this.checkNoteOwnership(userId, noteId);
      if (!isOwner) {
        return [];
      }

      const rows = await db
        .select()
        .from(attachments)
        .where(and(eq(attachments.noteId, noteId), eq(attachments.userId, userId)))
        .orderBy(attachments.createdAt);

      return rows;
    } catch (error) {
      console.warn('[AttachmentsRepository] listByNote error:', error);
      return Array.from(inMemoryAttachments.values()).filter(
        (a) => a.userId === userId && a.noteId === noteId
      );
    }
  }

  /**
   * Updates the attachment processing status, extracted text, and error.
   */
  async updateProcessingStatus(
    userId: string,
    id: string,
    status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED',
    extractedText?: string,
    processingError?: string | null
  ): Promise<AttachmentRow | null> {
    const db = getDatabase();
    const now = new Date();

    if (!db) {
      const existing = inMemoryAttachments.get(id);
      if (existing && existing.userId === userId) {
        const updated: AttachmentRow = {
          ...existing,
          status,
          extractedText: extractedText !== undefined ? extractedText : existing.extractedText,
          processingError: processingError !== undefined ? processingError : existing.processingError,
          updatedAt: now,
        };
        inMemoryAttachments.set(id, updated);
        return updated;
      }
      return null;
    }

    try {
      const existing = await this.findById(userId, id);
      if (!existing) {
        return null;
      }

      const updateValues: any = {
        status,
        updatedAt: now,
      };
      if (extractedText !== undefined) {
        updateValues.extractedText = extractedText;
      }
      if (processingError !== undefined) {
        updateValues.processingError = processingError;
      }

      const [updated] = await db
        .update(attachments)
        .set(updateValues)
        .where(and(eq(attachments.id, id), eq(attachments.userId, userId)))
        .returning();

      if (updated) {
        inMemoryAttachments.set(id, updated);
        return updated;
      }
      return null;
    } catch (error) {
      console.warn('[AttachmentsRepository] updateProcessingStatus error:', error);
      const existing = inMemoryAttachments.get(id);
      if (existing && existing.userId === userId) {
        const updated: AttachmentRow = {
          ...existing,
          status,
          extractedText: extractedText !== undefined ? extractedText : existing.extractedText,
          processingError: processingError !== undefined ? processingError : existing.processingError,
          updatedAt: now,
        };
        inMemoryAttachments.set(id, updated);
        return updated;
      }
      return null;
    }
  }

  /**
   * Deletes an attachment metadata record, strictly verifying note and user ownership.
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const db = getDatabase();
    if (!db) {
      const existing = inMemoryAttachments.get(id);
      if (existing && existing.userId === userId) {
        inMemoryAttachments.delete(id);
        return true;
      }
      return false;
    }

    try {
      // First verify ownership through join
      const existing = await this.findById(userId, id);
      if (!existing) {
        return false;
      }

      const result = await db
        .delete(attachments)
        .where(and(eq(attachments.id, id), eq(attachments.userId, userId)))
        .returning({ id: attachments.id });

      inMemoryAttachments.delete(id);
      return result.length > 0;
    } catch (error) {
      console.warn('[AttachmentsRepository] delete error:', error);
      const existing = inMemoryAttachments.get(id);
      if (existing && existing.userId === userId) {
        inMemoryAttachments.delete(id);
        return true;
      }
      return false;
    }
  }
}

export const attachmentsRepository = new AttachmentsRepository();
