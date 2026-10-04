import { Queue, QueueOptions } from 'bullmq';
import { getRedisClient } from './index';
import { logger } from '@/src/server/lib/logger';
import { config } from '@/src/server/lib/config';
import { indexingService } from '../search/indexing.service';

export const NOTE_INDEXING_QUEUE_NAME = 'livo-note-indexing';

export interface NoteIndexingJobData {
  action: 'index' | 'update' | 'delete';
  noteId: string;
  userId: string;
  notePayload?: Record<string, any>;
  queuedAt: string;
}

let noteIndexingQueue: Queue<NoteIndexingJobData> | null = null;

/**
 * Default job options enforcing exponential backoff retries.
 */
export const DEFAULT_INDEXING_JOB_OPTS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2s, 4s, 8s, 16s, 32s
  },
  removeOnComplete: {
    count: 200,
  },
  removeOnFail: {
    count: 1000,
  },
} as const;

/**
 * Lazy singleton accessor for the BullMQ Note Indexing Queue.
 */
export function getNoteIndexingQueue(): Queue<NoteIndexingJobData> | null {
  if (!config.redis.isConfigured) {
    return null;
  }

  if (!noteIndexingQueue) {
    const connection = getRedisClient();
    if (connection) {
      const queueOptions: QueueOptions = {
        connection,
        defaultJobOptions: DEFAULT_INDEXING_JOB_OPTS,
      };
      noteIndexingQueue = new Queue<NoteIndexingJobData>(NOTE_INDEXING_QUEUE_NAME, queueOptions);

      logger.info({
        service: 'queue',
        event: 'indexing_queue_initialized',
        meta: { queue: NOTE_INDEXING_QUEUE_NAME, retryAttempts: DEFAULT_INDEXING_JOB_OPTS.attempts },
      });
    }
  }

  return noteIndexingQueue;
}

/**
 * Dispatches an asynchronous note indexing job into the BullMQ queue.
 *
 * RESILIENCE REQUIREMENT:
 * If Redis or BullMQ is unavailable, PostgreSQL note operations MUST still succeed.
 * In that fallback scenario, an asynchronous non-blocking direct indexing attempt is
 * made, and a structured warning is emitted without bubbling an exception.
 */
export async function queueNoteIndexingJob(data: {
  action: 'index' | 'update' | 'delete';
  noteId: string;
  userId: string;
  notePayload?: Record<string, any>;
}): Promise<boolean> {
  const startTime = Date.now();
  const jobPayload: NoteIndexingJobData = {
    ...data,
    queuedAt: new Date().toISOString(),
  };

  try {
    const queue = getNoteIndexingQueue();

    if (queue) {
      const job = await queue.add(`note-${data.action}-${data.noteId}`, jobPayload, {
        jobId: `${data.action}-${data.noteId}-${Date.now()}`,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      logger.info({
        service: 'queue',
        event: 'job_enqueued',
        jobId: job.id,
        noteId: data.noteId,
        userId: data.userId,
        durationMs: Date.now() - startTime,
        meta: { action: data.action, queue: NOTE_INDEXING_QUEUE_NAME },
      });

      return true;
    }

    // Fallback: Redis is not configured.
    // Perform asynchronous non-blocking direct indexing so PostgreSQL writes are not blocked.
    logger.warn({
      service: 'queue',
      event: 'queue_unavailable_executing_async_direct',
      noteId: data.noteId,
      userId: data.userId,
      message: 'Redis queue is unconfigured or offline. Executing non-blocking direct index.',
    });

    // Execute direct indexing asynchronously without awaiting it inside the HTTP request lifecycle
    (async () => {
      try {
        if (data.action === 'delete') {
          await indexingService.deleteNote(data.noteId, data.userId);
        } else if (data.notePayload) {
          await indexingService.updateNote({
            ...data.notePayload,
            note_id: data.noteId,
            user_id: data.userId,
          });
        }
      } catch (err: any) {
        logger.warn({
          service: 'indexing',
          event: 'direct_async_index_warning',
          noteId: data.noteId,
          userId: data.userId,
          error: err,
        });
      }
    })();

    return true;
  } catch (error: any) {
    // Fail-safe: Log error, but NEVER fail the PostgreSQL note transaction
    logger.error({
      service: 'queue',
      event: 'job_enqueue_failed_swallowed_for_durability',
      noteId: data.noteId,
      userId: data.userId,
      durationMs: Date.now() - startTime,
      error,
    });
    return false;
  }
}
