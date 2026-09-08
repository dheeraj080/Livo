import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../lib/config';
import type { ServiceHealthStatus } from '@/src/types';

export interface StorageUploadParams {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface StorageUploadResult {
  key: string;
  size: number;
  etag?: string;
  contentType: string;
}

export interface StorageDownloadResult {
  body: Buffer;
  contentType?: string;
  contentLength?: number;
  metadata?: Record<string, string>;
}

/**
 * Clean StorageService Abstraction:
 * Decouples application logic from the underlying storage provider (MinIO, AWS S3, Cloudflare R2).
 */
export interface StorageService {
  /**
   * Uploads object binary to storage.
   */
  upload(params: StorageUploadParams): Promise<StorageUploadResult>;

  /**
   * Downloads object binary and metadata from storage.
   */
  download(key: string): Promise<StorageDownloadResult>;

  /**
   * Deletes an object by key.
   */
  delete(key: string): Promise<boolean>;

  /**
   * Checks whether an object exists at the given key.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Generates a time-limited presigned GET URL for secure download/viewing.
   */
  getPresignedDownloadUrl(
    key: string,
    expiresInSeconds?: number,
    responseContentDisposition?: string
  ): Promise<string>;

  /**
   * Generates a time-limited presigned PUT URL for direct client uploads.
   */
  getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds?: number
  ): Promise<string>;

  /**
   * Checks health and connectivity of the storage backend.
   */
  checkHealth(): Promise<ServiceHealthStatus>;
}

/**
 * Concrete S3-compatible implementation (works with MinIO, AWS S3, Cloudflare R2, Wasabi, etc.)
 */
export class S3StorageService implements StorageService {
  private client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly endpoint?: string;
  private readonly region: string;
  private bucketChecked = false;

  constructor() {
    this.bucketName = config.storage.bucketName;
    this.endpoint = config.storage.endpoint;
    this.region = config.storage.region;
  }

  private getClient(): S3Client {
    if (!this.client) {
      if (!config.storage.accessKeyId || !config.storage.secretAccessKey) {
        throw new Error('[StorageService] Missing S3 credentials. Set S3_ACCESS_KEY and S3_SECRET_KEY.');
      }

      this.client = new S3Client({
        endpoint: this.endpoint,
        region: this.region,
        credentials: {
          accessKeyId: config.storage.accessKeyId,
          secretAccessKey: config.storage.secretAccessKey,
        },
        forcePathStyle: config.storage.forcePathStyle,
      });
    }

    return this.client;
  }

  /**
   * Ensures the target bucket exists, creating it if needed on MinIO/S3.
   */
  private async ensureBucket(): Promise<void> {
    if (this.bucketChecked) return;

    try {
      const client = this.getClient();
      await client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.bucketChecked = true;
    } catch (error: any) {
      const statusCode = error.$metadata?.httpStatusCode;
      if (statusCode === 404 || error.name === 'NotFound' || error.name === 'NoSuchBucket') {
        try {
          const client = this.getClient();
          await client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          this.bucketChecked = true;
        } catch (createErr: any) {
          // If another concurrent request created it or bucket already owned, proceed
          if (createErr.name === 'BucketAlreadyOwnedByYou' || createErr.name === 'BucketAlreadyExists') {
            this.bucketChecked = true;
            return;
          }
          console.warn('[StorageService] Failed to auto-create bucket:', createErr.message);
        }
      } else {
        // Continue and let individual operations surface definitive error
        console.warn('[StorageService] Bucket check warning:', error.message);
      }
    }
  }

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    await this.ensureBucket();
    const client = this.getClient();

    const buffer = Buffer.isBuffer(params.body)
      ? params.body
      : Buffer.from(params.body);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      Body: buffer,
      ContentType: params.contentType,
      Metadata: params.metadata,
    });

    const response = await client.send(command);

    return {
      key: params.key,
      size: buffer.length,
      etag: response.ETag,
      contentType: params.contentType,
    };
  }

  async download(key: string): Promise<StorageDownloadResult> {
    const client = this.getClient();

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await client.send(command);

    if (!response.Body) {
      throw new Error(`[StorageService] Empty body received for key: ${key}`);
    }

    const byteArray = await response.Body.transformToByteArray();
    const bodyBuffer = Buffer.from(byteArray);

    return {
      body: bodyBuffer,
      contentType: response.ContentType,
      contentLength: response.ContentLength || bodyBuffer.length,
      metadata: response.Metadata,
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      const client = this.getClient();
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await client.send(command);
      return true;
    } catch (error: any) {
      console.error(`[StorageService] Delete failed for ${key}:`, error.message);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = this.getClient();
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await client.send(command);
      return true;
    } catch (error: any) {
      const statusCode = error.$metadata?.httpStatusCode;
      if (statusCode === 404 || error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  async getPresignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600,
    responseContentDisposition?: string
  ): Promise<string> {
    const client = this.getClient();

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ResponseContentDisposition: responseContentDisposition,
    });

    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 900
  ): Promise<string> {
    await this.ensureBucket();
    const client = this.getClient();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  async checkHealth(): Promise<ServiceHealthStatus> {
    if (!config.storage.isConfigured) {
      return {
        name: 'MinIO / S3 Object Storage',
        status: 'unconfigured',
        configured: false,
        message: 'S3_ENDPOINT, S3_ACCESS_KEY, or S3_SECRET_KEY not set.',
      };
    }

    const start = Date.now();
    try {
      const client = this.getClient();
      await client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      return {
        name: 'MinIO / S3 Object Storage',
        status: 'connected',
        configured: true,
        latencyMs: Date.now() - start,
        message: `Connected to bucket "${this.bucketName}" at ${this.endpoint || 'AWS'}`,
      };
    } catch (error: any) {
      return {
        name: 'MinIO / S3 Object Storage',
        status: 'error',
        configured: true,
        latencyMs: Date.now() - start,
        message: error.message || 'Failed to ping S3 storage bucket',
      };
    }
  }
}

/**
 * In-Memory Fallback Storage Service:
 * Active only when S3/MinIO is not configured in local preview/container environment.
 * NEVER stores file bytes in PostgreSQL! File bytes are stored strictly in this memory buffer map.
 */
export class InMemoryStorageService implements StorageService {
  private objects = new Map<
    string,
    { body: Buffer; contentType: string; metadata?: Record<string, string>; createdAt: number }
  >();

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    const buffer = Buffer.isBuffer(params.body)
      ? params.body
      : Buffer.from(params.body);

    this.objects.set(params.key, {
      body: buffer,
      contentType: params.contentType,
      metadata: params.metadata,
      createdAt: Date.now(),
    });

    return {
      key: params.key,
      size: buffer.length,
      contentType: params.contentType,
      etag: `"mem-${params.key}"`,
    };
  }

  async download(key: string): Promise<StorageDownloadResult> {
    const item = this.objects.get(key);
    if (!item) {
      throw new Error(`[InMemoryStorage] Object not found for key: ${key}`);
    }

    return {
      body: item.body,
      contentType: item.contentType,
      contentLength: item.body.length,
      metadata: item.metadata,
    };
  }

  async delete(key: string): Promise<boolean> {
    return this.objects.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.objects.has(key);
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    // For local fallback, return an internal proxy download path
    return `/api/attachments/raw?key=${encodeURIComponent(key)}`;
  }

  async getPresignedUploadUrl(key: string): Promise<string> {
    return `/api/attachments/raw?key=${encodeURIComponent(key)}`;
  }

  async checkHealth(): Promise<ServiceHealthStatus> {
    return {
      name: 'MinIO / S3 Object Storage',
      status: 'unconfigured',
      configured: false,
      message: 'Running in-memory fallback. Configure S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET for full MinIO/S3.',
    };
  }
}

/**
 * Factory creating the active StorageService:
 * Defaults to S3StorageService whenever S3 credentials and endpoint are present,
 * gracefully falling back to InMemoryStorageService in unconfigured preview sessions.
 */
function createStorageService(): StorageService {
  if (config.storage.isConfigured) {
    return new S3StorageService();
  }
  return new InMemoryStorageService();
}

export const storageService: StorageService = createStorageService();
