import { storageService, StorageService, S3StorageService, InMemoryStorageService } from './storage.service';
import type { StorageUploadParams, StorageUploadResult, StorageDownloadResult } from './storage.service';
import type { ServiceHealthStatus } from '@/src/types';

export {
  storageService,
  S3StorageService,
  InMemoryStorageService,
};

export type {
  StorageService,
  StorageUploadParams,
  StorageUploadResult,
  StorageDownloadResult,
};

/**
 * Health check compatibility wrapper.
 */
export async function checkStorageHealth(): Promise<ServiceHealthStatus> {
  return storageService.checkHealth();
}

/**
 * Upload compatibility wrapper.
 */
export async function uploadAttachment(params: StorageUploadParams): Promise<StorageUploadResult> {
  return storageService.upload(params);
}

/**
 * Download compatibility wrapper.
 */
export async function downloadAttachment(key: string): Promise<StorageDownloadResult> {
  return storageService.download(key);
}

/**
 * Delete compatibility wrapper.
 */
export async function deleteAttachment(key: string): Promise<boolean> {
  return storageService.delete(key);
}

/**
 * Existence check compatibility wrapper.
 */
export async function checkAttachmentExists(key: string): Promise<boolean> {
  return storageService.exists(key);
}

/**
 * Presigned download URL wrapper.
 */
export async function getAttachmentPresignedUrl(
  key: string,
  expiresInSeconds = 3600,
  responseContentDisposition?: string
): Promise<string> {
  return storageService.getPresignedDownloadUrl(key, expiresInSeconds, responseContentDisposition);
}
