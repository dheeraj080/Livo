import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/src/server/services/db';
import { checkElasticsearchHealth } from '@/src/server/services/search';
import { checkRedisHealth } from '@/src/server/services/jobs';
import { checkStorageHealth } from '@/src/server/services/storage';
import { checkGeminiHealth } from '@/src/server/services/ai';
import type { HealthCheckResponse } from '@/src/types';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

export async function GET() {
  try {
    const [postgres, elasticsearch, redis, storage, gemini] = await Promise.all([
      checkDatabaseHealth(),
      checkElasticsearchHealth(),
      checkRedisHealth(),
      checkStorageHealth(),
      checkGeminiHealth(),
    ]);

    const serviceList = [postgres, elasticsearch, redis, storage, gemini];
    const hasErrors = serviceList.some((s) => s.status === 'error');
    const allConnected = serviceList.every((s) => s.status === 'connected');

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (hasErrors) {
      status = 'unhealthy';
    } else if (!allConnected) {
      // Some services may be unconfigured or disconnected while awaiting deployment credentials
      status = 'degraded';
    }

    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      services: {
        postgres,
        elasticsearch,
        redis,
        storage,
        gemini,
      },
    };

    return NextResponse.json(response, {
      status: status === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error?.message || 'Failed to inspect system health',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
