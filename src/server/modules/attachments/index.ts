import { z } from "zod";
import { attachmentsRepository } from "../../repositories/attachments.repository";
import { storageService } from "../../services/storage";
import { queueDocumentProcessingJob } from "../../services/jobs";
import {
  validateAttachment,
  validateImageMagicBytes,
  generateStorageKey,
  sanitizeFilename,
  MAX_ATTACHMENT_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_ATTACHMENT_MIME_TYPES,
} from "./validation";
import type { Attachment } from "@/src/types";

export {
  validateAttachment,
  validateImageMagicBytes,
  generateStorageKey,
  sanitizeFilename,
  MAX_ATTACHMENT_SIZE_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_ATTACHMENT_MIME_TYPES,
};

export const attachmentUploadSchema = z.object({
  noteId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  isImageOnly: z.boolean().optional(),
});

/**
 * Lists all attachments for a specific note.
 * Securely enforces authorization: only attachments belonging to notes owned by the user are returned.
 */
export async function listNoteAttachments(
  userId: string,
  noteId: string,
): Promise<Attachment[]> {
  try {
    const rows = await attachmentsRepository.listByNote(userId, noteId);

    const attachmentsWithUrls: Attachment[] = await Promise.all(
      rows.map(async (r) => {
        let presignedUrl: string | undefined;
        try {
          presignedUrl = await storageService.getPresignedDownloadUrl(
            r.storageKey,
            3600,
            `inline; filename="${encodeURIComponent(r.filename)}"`,
          );
        } catch {
          // If presigning fails or S3 unconfigured, proxy route will be used
        }

        const proxyDownloadUrl = `/api/attachments/${r.id}/download`;

        return {
          id: r.id,
          noteId: r.noteId,
          userId: r.userId,
          filename: r.filename,
          size: r.size,
          sizeBytes: r.size,
          mimeType: r.mimeType,
          contentType: r.mimeType,
          storageKey: r.storageKey,
          presignedUrl,
          url: presignedUrl || proxyDownloadUrl,
          publicUrl: presignedUrl || proxyDownloadUrl,
          status: (r.status as any) || "UPLOADED",
          extractedText: r.extractedText || undefined,
          processingError: r.processingError || undefined,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt ? r.updatedAt.toISOString() : undefined,
        };
      }),
    );

    return attachmentsWithUrls;
  } catch (error) {
    console.error("[livo Attachments] listNoteAttachments error:", error);
    return [];
  }
}

/**
 * Uploads an attachment file to S3/MinIO and records metadata in PostgreSQL.
 *
 * Enforces:
 * 1. Note ownership check (user may only attach to notes they own)
 * 2. File size limits (<= 10MB)
 * 3. MIME type validation (and magic bytes for images)
 * 4. Filename sanitization
 * 5. Safe, collision-free storage keys
 * 6. NO binary bytes in PostgreSQL (metadata only)
 */
export async function uploadNoteAttachment(data: {
  userId: string;
  noteId: string;
  filename: string;
  mimeType: string;
  size: number;
  fileBuffer: Buffer;
  isImageOnly?: boolean;
}): Promise<Attachment> {
  // 1. Check note ownership
  const isOwner = await attachmentsRepository.checkNoteOwnership(
    data.userId,
    data.noteId,
  );
  if (!isOwner) {
    throw new Error(
      "Unauthorized: Note does not exist or is not owned by the user.",
    );
  }

  // 2. Validate file size and MIME type
  const validation = validateAttachment({
    filename: data.filename,
    mimeType: data.mimeType,
    size: data.size,
    isImageOnly: data.isImageOnly,
  });

  if (!validation.valid) {
    throw new Error(validation.error || "Attachment validation failed.");
  }

  // 3. Magic bytes validation for image attachments
  if (data.isImageOnly || validation.normalizedMimeType.startsWith("image/")) {
    const isMagicValid = validateImageMagicBytes(data.fileBuffer);
    if (!isMagicValid) {
      throw new Error(
        "Invalid image file contents. Header does not match expected image format.",
      );
    }
  }

  // 4. Generate safe storage key
  const safeFilename = validation.sanitizedFilename;
  const storageKey = generateStorageKey(data.userId, data.noteId, safeFilename);

  // 5. Store file binary strictly in S3-compatible object storage (never in PostgreSQL)
  await storageService.upload({
    key: storageKey,
    body: data.fileBuffer,
    contentType: validation.normalizedMimeType,
    metadata: {
      userId: data.userId,
      noteId: data.noteId,
      originalFilename: encodeURIComponent(data.filename),
    },
  });

  // 6. Store ONLY attachment metadata in PostgreSQL
  const record = await attachmentsRepository.create(data.userId, {
    noteId: data.noteId,
    storageKey,
    filename: safeFilename,
    mimeType: validation.normalizedMimeType,
    size: data.size,
  });

  // 7. Queue asynchronous document processing job (non-blocking)
  queueDocumentProcessingJob({
    attachmentId: record.id,
    userId: data.userId,
    noteId: data.noteId,
    storageKey,
    filename: safeFilename,
    mimeType: validation.normalizedMimeType,
  }).catch((err) => {
    console.error(
      "[livo Attachments] Failed to queue document processing job:",
      err,
    );
  });

  // 8. Generate presigned download URL
  let presignedUrl: string | undefined;
  try {
    presignedUrl = await storageService.getPresignedDownloadUrl(
      storageKey,
      3600,
      `inline; filename="${encodeURIComponent(safeFilename)}"`,
    );
  } catch {
    // S3 unconfigured or fallback
  }

  const proxyDownloadUrl = `/api/attachments/${record.id}/download`;

  return {
    id: record.id,
    noteId: record.noteId,
    userId: record.userId,
    filename: record.filename,
    size: record.size,
    sizeBytes: record.size,
    mimeType: record.mimeType,
    contentType: record.mimeType,
    storageKey: record.storageKey,
    presignedUrl,
    url: presignedUrl || proxyDownloadUrl,
    publicUrl: presignedUrl || proxyDownloadUrl,
    status: (record.status as any) || "UPLOADED",
    extractedText: record.extractedText || undefined,
    processingError: record.processingError || undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt ? record.updatedAt.toISOString() : undefined,
  };
}

/**
 * Retrieves a single attachment record with secure authorization.
 * Verifies that the attachment belongs to a note owned by the user.
 */
export async function getAttachmentForUser(
  userId: string,
  attachmentId: string,
): Promise<Attachment | null> {
  const record = await attachmentsRepository.findById(userId, attachmentId);
  if (!record) {
    return null;
  }

  let presignedUrl: string | undefined;
  try {
    presignedUrl = await storageService.getPresignedDownloadUrl(
      record.storageKey,
      3600,
      `inline; filename="${encodeURIComponent(record.filename)}"`,
    );
  } catch {
    // Fallback
  }

  const proxyDownloadUrl = `/api/attachments/${record.id}/download`;

  return {
    id: record.id,
    noteId: record.noteId,
    userId: record.userId,
    filename: record.filename,
    size: record.size,
    sizeBytes: record.size,
    mimeType: record.mimeType,
    contentType: record.mimeType,
    storageKey: record.storageKey,
    presignedUrl,
    url: presignedUrl || proxyDownloadUrl,
    publicUrl: presignedUrl || proxyDownloadUrl,
    status: (record.status as any) || "UPLOADED",
    extractedText: record.extractedText || undefined,
    processingError: record.processingError || undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt ? record.updatedAt.toISOString() : undefined,
  };
}

/**
 * Downloads the binary content of an attachment from S3/MinIO.
 * Strictly verifies that the attachment belongs to a note owned by the user.
 */
export async function downloadAttachmentContent(
  userId: string,
  attachmentId: string,
): Promise<{
  body: Buffer;
  mimeType: string;
  filename: string;
  size: number;
} | null> {
  const record = await attachmentsRepository.findById(userId, attachmentId);
  if (!record) {
    return null;
  }

  const result = await storageService.download(record.storageKey);

  return {
    body: result.body,
    mimeType: record.mimeType,
    filename: record.filename,
    size: record.size,
  };
}

/**
 * Deletes an attachment from S3/MinIO and its metadata from PostgreSQL.
 * Strictly verifies that the attachment belongs to a note owned by the user.
 */
export async function removeAttachment(
  userId: string,
  id: string,
): Promise<boolean> {
  const existing = await attachmentsRepository.findById(userId, id);
  if (!existing) {
    return false;
  }

  // 1. Delete object from S3-compatible storage
  await storageService
    .delete(existing.storageKey)
    .catch((err) =>
      console.warn("[livo Storage] S3 delete warning:", err.message),
    );

  // 2. Delete metadata row from PostgreSQL
  return attachmentsRepository.delete(userId, id);
}
