import { Worker, Job } from 'bullmq';
import { getRedisClient } from './index';
import { DOCUMENT_PROCESSING_QUEUE_NAME, type DocumentProcessingJobData } from './document-processing.queue';
import { attachmentsRepository } from '../../repositories/attachments.repository';
import { storageService } from '../storage';
import { extractDocumentText } from '../documents/extraction.service';
import { chunkText, type NoteChunkDocument } from '../search/chunker';
import { AiService } from '../ai/ai.service';
import { getElasticsearchClient } from '../search/client';
import { CHUNKS_INDEX, ensureChunksIndexExists } from '../search/indices';
import { logger } from '@/src/server/lib/logger';
import { config } from '@/src/server/lib/config';

let documentWorker: Worker<DocumentProcessingJobData> | null = null;

/**
 * Core internal document processing pipeline handler (reusable for direct async fallback or BullMQ worker).
 */
export async function processDocumentJobInternal(data: {
  attachmentId: string;
  userId: string;
  noteId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
}): Promise<void> {
  const { attachmentId, userId, noteId, storageKey, filename, mimeType } = data;
  const startTime = Date.now();

  logger.info({
    service: 'worker',
    event: 'document_processing_started',
    attachmentId,
    noteId,
    userId,
    filename,
  });

  try {
    // 1. Mark state as PROCESSING
    await attachmentsRepository.updateProcessingStatus(userId, attachmentId, 'PROCESSING');

    // 2. Download binary content from storage
    const downloadResult = await storageService.download(storageKey);
    if (!downloadResult || !downloadResult.body) {
      throw new Error(`Failed to download attachment binary from storage (Key: ${storageKey})`);
    }
    const fileBuffer = downloadResult.body;

    // 3 & 4. Extract text & normalize
    const extraction = await extractDocumentText(fileBuffer, mimeType, filename);
    const extractedText = extraction.text;

    // 5. Store extracted text and intermediate status
    await attachmentsRepository.updateProcessingStatus(
      userId,
      attachmentId,
      'PROCESSING',
      extractedText,
      null
    );

    // 6. Chunk text
    const chunks = chunkText(extractedText || filename);

    // 7. Index into Elasticsearch & generate embeddings (Idempotently)
    const esClient = getElasticsearchClient();
    if (esClient) {
      await ensureChunksIndexExists();

      // Idempotency: remove previous chunks associated with this attachment ID first
      await esClient.deleteByQuery({
        index: CHUNKS_INDEX,
        query: {
          term: { attachment_id: attachmentId },
        },
        refresh: false,
      }).catch(() => {});

      // Index each chunk with embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const chunkId = `att_${attachmentId}_chunk_${i}`;
        const embedding = await AiService.generateEmbedding(chunkContent);

        const chunkDoc: any = {
          chunk_id: chunkId,
          note_id: noteId,
          user_id: userId,
          notebook_id: null,
          attachment_id: attachmentId,
          title: filename,
          text: chunkContent,
          chunk_position: i,
          metadata: {
            wordCount: chunkContent.split(/\s+/).length,
            charCount: chunkContent.length,
            filename,
            mimeType,
          },
          embedding,
          updated_at: new Date().toISOString(),
        };

        await esClient.index({
          index: CHUNKS_INDEX,
          id: chunkId,
          document: chunkDoc,
          refresh: false,
        });
      }
    }

    // 8. Mark attachment as PROCESSED
    await attachmentsRepository.updateProcessingStatus(userId, attachmentId, 'PROCESSED', extractedText, null);

    logger.info({
      service: 'worker',
      event: 'document_processing_completed',
      attachmentId,
      noteId,
      userId,
      durationMs: Date.now() - startTime,
      meta: { chunksCount: chunks.length, charCount: extractedText.length },
    });
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown processing error';
    logger.error({
      service: 'worker',
      event: 'document_processing_failed',
      attachmentId,
      noteId,
      userId,
      error,
      durationMs: Date.now() - startTime,
    });

    // Mark as FAILED and store processing error
    await attachmentsRepository.updateProcessingStatus(
      userId,
      attachmentId,
      'FAILED',
      undefined,
      errorMsg
    ).catch(() => {});

    throw error;
  }
}

/**
 * BullMQ Job processor wrapper.
 */
export async function processDocumentJob(job: Job<DocumentProcessingJobData>): Promise<void> {
  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts.attempts || 5;

  logger.info({
    service: 'worker',
    event: 'document_job_processing',
    jobId: job.id,
    attachmentId: job.data.attachmentId,
    attempt,
    maxAttempts,
  });

  try {
    await processDocumentJobInternal(job.data);
  } catch (error: any) {
    logger.warn({
      service: 'worker',
      event: 'document_job_failed_retrying',
      jobId: job.id,
      attachmentId: job.data.attachmentId,
      attempt,
      maxAttempts,
      error: error?.message,
    });
    throw error; // Re-throw to trigger BullMQ exponential backoff retry
  }
}

/**
 * Lazy initialization of the BullMQ document processing worker.
 */
export function getOrCreateDocumentProcessingWorker(): Worker<DocumentProcessingJobData> | null {
  if (!config.redis.isConfigured) {
    return null;
  }

  if (!documentWorker) {
    const connection = getRedisClient();
    if (!connection) return null;

    documentWorker = new Worker<DocumentProcessingJobData>(
      DOCUMENT_PROCESSING_QUEUE_NAME,
      async (job) => {
        await processDocumentJob(job);
      },
      {
        connection,
        concurrency: 3,
      }
    );

    documentWorker.on('completed', (job) => {
      logger.debug({
        service: 'worker',
        event: 'document_bullmq_job_completed',
        jobId: job.id,
      });
    });

    documentWorker.on('failed', (job, err) => {
      logger.warn({
        service: 'worker',
        event: 'document_bullmq_job_failed',
        jobId: job?.id,
        error: err?.message,
      });
    });

    documentWorker.on('error', (err) => {
      logger.error({
        service: 'worker',
        event: 'document_bullmq_worker_error',
        error: err,
      });
    });

    logger.info({
      service: 'worker',
      event: 'document_processing_worker_started',
      meta: { queue: DOCUMENT_PROCESSING_QUEUE_NAME, concurrency: 3 },
    });
  }

  return documentWorker;
}
