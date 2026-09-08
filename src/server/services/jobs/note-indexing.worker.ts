import { Worker, Job } from 'bullmq';
import { getRedisClient } from './index';
import { NOTE_INDEXING_QUEUE_NAME, type NoteIndexingJobData } from './note-indexing.queue';
import { indexingService } from '../search/indexing.service';
import { notesRepository } from '../../repositories/notes.repository';
import { logger } from '@/src/server/lib/logger';
import { config } from '@/src/server/lib/config';

let indexingWorker: Worker<NoteIndexingJobData> | null = null;

/**
 * Worker processor handling note projection indexing to Elasticsearch.
 * Flow: PostgreSQL -> BullMQ Job -> Indexing Worker -> Elasticsearch.
 *
 * RESILIENCE REQUIREMENT:
 * If Elasticsearch is unavailable, throwing inside this worker causes BullMQ
 * to schedule an automatic exponential backoff retry up to 5 times.
 */
export async function processNoteIndexingJob(job: Job<NoteIndexingJobData>): Promise<void> {
  const { action, noteId, userId, notePayload } = job.data;
  const startTime = Date.now();
  const attempt = job.attemptsMade + 1;
  const maxAttempts = job.opts.attempts || 5;

  logger.info({
    service: 'worker',
    event: 'indexing_job_started',
    jobId: job.id,
    noteId,
    userId,
    attempt,
    maxAttempts,
    meta: { action, queue: NOTE_INDEXING_QUEUE_NAME },
  });

  try {
    if (action === 'delete') {
      await indexingService.deleteNote(noteId, userId);
    } else {
      // For index or update, verify against PostgreSQL authoritative source
      const authoritativeNote = await notesRepository.findById(userId, noteId, {
        includeDeleted: true,
      });

      if (authoritativeNote && !authoritativeNote.deletedAt) {
        // Active note: index or update projection
        await indexingService.updateNote({
          id: authoritativeNote.id,
          userId: authoritativeNote.userId,
          notebookId: authoritativeNote.notebookId,
          title: authoritativeNote.title,
          contentText: authoritativeNote.contentText || '',
          tags: authoritativeNote.tags.map((t) => t.id),
          createdAt: authoritativeNote.createdAt,
          updatedAt: authoritativeNote.updatedAt,
        });
      } else if (authoritativeNote && authoritativeNote.deletedAt) {
        // Soft-deleted note in PostgreSQL: remove from Elasticsearch search projection
        await indexingService.deleteNote(noteId, userId);
      } else if (notePayload) {
        // Fallback to payload if note row not found immediately
        await indexingService.updateNote({
          ...notePayload,
          note_id: noteId,
          user_id: userId,
        });
      } else {
        // Note completely removed from PostgreSQL: remove from Elasticsearch
        await indexingService.deleteNote(noteId, userId);
      }
    }

    const durationMs = Date.now() - startTime;
    logger.info({
      service: 'worker',
      event: 'indexing_job_completed',
      jobId: job.id,
      noteId,
      userId,
      attempt,
      durationMs,
      meta: { action },
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.error({
      service: 'worker',
      event: 'indexing_job_failed_triggering_retry',
      jobId: job.id,
      noteId,
      userId,
      attempt,
      maxAttempts,
      durationMs,
      error,
      meta: { action, willRetry: attempt < maxAttempts },
    });

    // Re-throw so BullMQ triggers retry with exponential backoff
    throw error;
  }
}

/**
 * Lazy initialization of the BullMQ indexing worker.
 */
export function getOrCreateNoteIndexingWorker(): Worker<NoteIndexingJobData> | null {
  if (!config.redis.isConfigured) {
    return null;
  }

  if (!indexingWorker) {
    const connection = getRedisClient();
    if (!connection) return null;

    indexingWorker = new Worker<NoteIndexingJobData>(
      NOTE_INDEXING_QUEUE_NAME,
      async (job) => {
        await processNoteIndexingJob(job);
      },
      {
        connection,
        concurrency: 5,
      }
    );

    indexingWorker.on('completed', (job) => {
      logger.debug({
        service: 'worker',
        event: 'bullmq_job_finished',
        jobId: job.id,
      });
    });

    indexingWorker.on('failed', (job, err) => {
      logger.warn({
        service: 'worker',
        event: 'bullmq_job_failed_event',
        jobId: job?.id,
        attempt: job?.attemptsMade,
        error: err?.message,
      });
    });

    indexingWorker.on('error', (err) => {
      logger.error({
        service: 'worker',
        event: 'bullmq_worker_error',
        error: err,
      });
    });

    logger.info({
      service: 'worker',
      event: 'indexing_worker_started',
      meta: { queue: NOTE_INDEXING_QUEUE_NAME, concurrency: 5 },
    });
  }

  return indexingWorker;
}
