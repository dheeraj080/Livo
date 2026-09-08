import { Queue, QueueOptions } from 'bullmq';
import { getRedisClient } from './index';
import { logger } from '@/src/server/lib/logger';
import { config } from '@/src/server/lib/config';

export const DOCUMENT_PROCESSING_QUEUE_NAME = 'livo-document-processing';

export interface DocumentProcessingJobData {
  attachmentId: string;
  userId: string;
  noteId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  queuedAt: string;
}

let documentQueue: Queue<DocumentProcessingJobData> | null = null;

export const DEFAULT_DOCUMENT_JOB_OPTS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 3000, // 3s, 6s, 12s, 24s, 48s
  },
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 1000 },
} as const;

export function getDocumentProcessingQueue(): Queue<DocumentProcessingJobData> | null {
  if (!config.redis.isConfigured) {
    return null;
  }

  if (!documentQueue) {
    const connection = getRedisClient();
    if (connection) {
      documentQueue = new Queue<DocumentProcessingJobData>(DOCUMENT_PROCESSING_QUEUE_NAME, {
        connection,
        defaultJobOptions: DEFAULT_DOCUMENT_JOB_OPTS,
      });

      logger.info({
        service: 'queue',
        event: 'document_queue_initialized',
        meta: { queue: DOCUMENT_PROCESSING_QUEUE_NAME },
      });
    }
  }

  return documentQueue;
}

export async function queueDocumentProcessingJob(data: {
  attachmentId: string;
  userId: string;
  noteId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
}): Promise<boolean> {
  const jobPayload: DocumentProcessingJobData = {
    ...data,
    queuedAt: new Date().toISOString(),
  };

  try {
    const queue = getDocumentProcessingQueue();
    if (queue) {
      await queue.add(`process-attachment-${data.attachmentId}`, jobPayload, {
        jobId: `doc-process-${data.attachmentId}-${Date.now()}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 3000 },
      });
      logger.info({
        service: 'queue',
        event: 'document_job_enqueued',
        attachmentId: data.attachmentId,
        userId: data.userId,
      });
      return true;
    }

    // Fallback if Redis offline: execute processing asynchronously in background without blocking
    logger.warn({
      service: 'queue',
      event: 'queue_unavailable_executing_async_document_processing',
      attachmentId: data.attachmentId,
    });

    (async () => {
      try {
        const { processDocumentJobInternal } = await import('./document-processing.worker');
        await processDocumentJobInternal(data);
      } catch (err: any) {
        logger.error({
          service: 'worker',
          event: 'direct_async_document_processing_failed',
          attachmentId: data.attachmentId,
          error: err,
        });
      }
    })();

    return true;
  } catch (error: any) {
    logger.error({
      service: 'queue',
      event: 'document_job_enqueue_failed',
      attachmentId: data.attachmentId,
      error,
    });
    return false;
  }
}
