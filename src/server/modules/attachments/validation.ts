import crypto from 'crypto';

/**
 * Maximum attachment size: 10 Megabytes.
 */
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Allowed MIME types for images embedded in notes and editor.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
] as const;

/**
 * Permitted general attachment MIME types.
 * Executable binaries, scripts, and HTML are strictly prohibited.
 */
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
] as const;

/**
 * Sanitizes a client-provided filename:
 * - Strips directory traversal (../, ..\, /, \)
 * - Strips null bytes and non-printable control characters
 * - Normalizes consecutive periods and spaces
 * - Constrains to safe alphanumeric and select punctuation characters [a-zA-Z0-9._-]
 * - Preserves a clean extension while truncating to a safe length (<= 100 chars)
 */
export function sanitizeFilename(rawFilename: string): string {
  if (!rawFilename || typeof rawFilename !== 'string') {
    return `attachment-${crypto.randomUUID().slice(0, 8)}.bin`;
  }

  // Strip path traversal and path separators
  let name = rawFilename.replace(/^.*[/\\]/, '');

  // Strip null bytes and non-printable ASCII / control characters
  name = name.replace(/[\x00-\x1f\x7f]/g, '');

  // Strip relative navigation sequences
  name = name.replace(/\.\.+/g, '.');

  // Strip leading dots to prevent hidden files
  name = name.replace(/^\.+/, '');

  // Replace any characters not in the safe whitelist
  name = name.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Collapse multiple underscores or dashes
  name = name.replace(/_+/g, '_').replace(/-+/g, '-');

  // If filename became empty after sanitization, assign fallback
  if (!name.trim() || name === '.' || name === '_') {
    return `file-${crypto.randomUUID().slice(0, 8)}.bin`;
  }

  // Bound maximum length while preserving extension
  if (name.length > 100) {
    const lastDotIndex = name.lastIndexOf('.');
    if (lastDotIndex > 0 && lastDotIndex > name.length - 12) {
      const ext = name.slice(lastDotIndex);
      const base = name.slice(0, 100 - ext.length);
      name = `${base}${ext}`;
    } else {
      name = name.slice(0, 100);
    }
  }

  return name;
}

/**
 * Generates an isolated, safe, collision-free S3 object storage key.
 * Format: users/${userId}/notes/${noteId}/${randomUUID}-${sanitizedFilename}
 *
 * This guarantees:
 * 1. Complete tenant segregation by userId and noteId
 * 2. Inability to traverse parent S3 prefixes
 * 3. Zero key collisions even with identical filenames
 */
export function generateStorageKey(userId: string, noteId: string, rawFilename: string): string {
  const safeFilename = sanitizeFilename(rawFilename);
  const uniquePrefix = crypto.randomUUID();
  return `users/${userId}/notes/${noteId}/${uniquePrefix}-${safeFilename}`;
}

export interface AttachmentValidationOptions {
  filename: string;
  mimeType: string;
  size: number;
  isImageOnly?: boolean;
}

export interface AttachmentValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename: string;
  normalizedMimeType: string;
}

/**
 * Validates file size, MIME type, and sanitizes filename.
 */
export function validateAttachment(
  options: AttachmentValidationOptions
): AttachmentValidationResult {
  const { filename, mimeType, size, isImageOnly = false } = options;

  // 1. File size check
  if (size <= 0) {
    return {
      valid: false,
      error: 'Uploaded file cannot be empty (0 bytes).',
      sanitizedFilename: sanitizeFilename(filename),
      normalizedMimeType: mimeType,
    };
  }

  if (size > MAX_ATTACHMENT_SIZE_BYTES) {
    const sizeMb = (size / (1024 * 1024)).toFixed(2);
    const limitMb = (MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of ${limitMb} MB.`,
      sanitizedFilename: sanitizeFilename(filename),
      normalizedMimeType: mimeType,
    };
  }

  // 2. MIME type check
  const normalizedMime = (mimeType || 'application/octet-stream').toLowerCase().trim();

  if (isImageOnly) {
    const isAllowedImage = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(normalizedMime);
    if (!isAllowedImage) {
      return {
        valid: false,
        error: `Invalid image type '${normalizedMime}'. Supported formats: JPEG, PNG, GIF, WebP, SVG, BMP.`,
        sanitizedFilename: sanitizeFilename(filename),
        normalizedMimeType: normalizedMime,
      };
    }
  } else {
    const isAllowed = (ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(normalizedMime);
    if (!isAllowed) {
      return {
        valid: false,
        error: `MIME type '${normalizedMime}' is not permitted.`,
        sanitizedFilename: sanitizeFilename(filename),
        normalizedMimeType: normalizedMime,
      };
    }
  }

  return {
    valid: true,
    sanitizedFilename: sanitizeFilename(filename),
    normalizedMimeType: normalizedMime,
  };
}

/**
 * Inspects buffer magic bytes for images to prevent MIME-spoofing attacks.
 */
export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  // GIF: 47 49 46 38 ("GIF8")
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  // BMP: BM (42 4D)
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return true;
  }

  // SVG: text header with <svg or <?xml
  const headerSlice = buffer.slice(0, Math.min(buffer.length, 512)).toString('utf-8').toLowerCase();
  if (headerSlice.includes('<svg') || (headerSlice.includes('<?xml') && headerSlice.includes('<svg'))) {
    return true;
  }

  return false;
}
