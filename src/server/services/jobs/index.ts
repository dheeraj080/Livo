import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { config } from '@/src/server/lib/config';
import type { ServiceHealthStatus } from '@/src/types';

let redisClient: Redis | null = null;
let aiJobQueue: Queue | null = null;

export function getRedisClient(): Redis | null {
  if (!config.redis.isConfigured) {
    return null;
  }

  if (!redisClient) {
    const redisOptions: any = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 5000,
      lazyConnect: true,
    };

    if (config.redis.url) {
      redisClient = new Redis(config.redis.url, redisOptions);
    } else {
      redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        ...redisOptions,
      });
    }

    redisClient.on('error', (err) => {
      console.warn('[livo Redis] Connection notice:', err.message);
    });
  }

  return redisClient;
}

export function getAIJobQueue(): Queue | null {
  if (!config.redis.isConfigured) return null;
  if (!aiJobQueue) {
    const connection = getRedisClient();
    if (connection) {
      aiJobQueue = new Queue('livo-ai-processing', { connection });
    }
  }
  return aiJobQueue;
}

export async function checkRedisHealth(): Promise<ServiceHealthStatus> {
  if (!config.redis.isConfigured) {
    return {
      name: 'Redis + BullMQ',
      configured: false,
      status: 'unconfigured',
      message: 'REDIS_URL or REDIS_HOST environment variables are not set',
    };
  }

  const startTime = Date.now();
  const client = getRedisClient();

  if (!client) {
    return {
      name: 'Redis + BullMQ',
      configured: true,
      status: 'disconnected',
      message: 'Failed to initialize Redis client',
    };
  }

  try {
    if (client.status !== 'ready' && client.status !== 'connecting') {
      await client.connect();
    }
    const pong = await client.ping();
    const latencyMs = Date.now() - startTime;

    if (pong === 'PONG') {
      return {
        name: 'Redis + BullMQ',
        configured: true,
        status: 'connected',
        latencyMs,
        message: `Connected successfully (${latencyMs}ms)`,
      };
    }

    return {
      name: 'Redis + BullMQ',
      configured: true,
      status: 'disconnected',
      message: `Unexpected Redis response: ${pong}`,
    };
  } catch (error: any) {
    return {
      name: 'Redis + BullMQ',
      configured: true,
      status: 'error',
      message: error?.message || 'Redis connection error',
    };
  }
}

// Export BullMQ indexing queue & worker
export * from './note-indexing.queue';
export * from './note-indexing.worker';

// Export BullMQ document processing queue & worker
export * from './document-processing.queue';
export * from './document-processing.worker';

// Auto-initialize workers if Redis is configured
import { getOrCreateNoteIndexingWorker } from './note-indexing.worker';
import { getOrCreateDocumentProcessingWorker } from './document-processing.worker';

try {
  getOrCreateNoteIndexingWorker();
  getOrCreateDocumentProcessingWorker();
} catch (e) {
  // worker init deferred
}

