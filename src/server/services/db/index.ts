import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '@/src/server/lib/config';
import * as schema from './schema';
import { runDatabaseMigrations } from './migrate';
import type { ServiceHealthStatus } from '@/src/types';

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let migrationInitiated = false;

export function getDatabasePool(): Pool | null {
  if (!config.postgres.isConfigured || !config.postgres.connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: config.postgres.connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[livo DB] Unexpected error on idle PostgreSQL client', err);
    });
  }

  return pool;
}

export function getDatabase() {
  if (!dbInstance) {
    const activePool = getDatabasePool();
    if (activePool) {
      dbInstance = drizzle(activePool, { schema });
      if (!migrationInitiated) {
        migrationInitiated = true;
        runDatabaseMigrations().catch((err) => {
          console.warn('[livo DB] Auto migration execution notice:', err.message);
        });
      }
    }
  }
  return dbInstance;
}

export async function checkDatabaseHealth(): Promise<ServiceHealthStatus> {
  if (!config.postgres.isConfigured || !config.postgres.connectionString) {
    return {
      name: 'PostgreSQL',
      configured: false,
      status: 'unconfigured',
      message: 'DATABASE_URL environment variable is not set',
    };
  }

  const startTime = Date.now();
  const testPool = getDatabasePool();

  if (!testPool) {
    return {
      name: 'PostgreSQL',
      configured: true,
      status: 'disconnected',
      message: 'Unable to initialize connection pool',
    };
  }

  try {
    const client = await testPool.connect();
    try {
      await client.query('SELECT 1 as health_check');
      const latencyMs = Date.now() - startTime;
      return {
        name: 'PostgreSQL',
        configured: true,
        status: 'connected',
        latencyMs,
        message: `Connected successfully (${latencyMs}ms)`,
      };
    } finally {
      client.release();
    }
  } catch (error: any) {
    return {
      name: 'PostgreSQL',
      configured: true,
      status: 'error',
      message: error?.message || 'Database connection error',
    };
  }
}

export { schema, runDatabaseMigrations };
