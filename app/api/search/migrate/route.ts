import { NextResponse } from 'next/server';
import { migrateNotesIndex, checkElasticsearchHealth } from '@/src/server/services/search';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const health = await checkElasticsearchHealth();
    if (health.status !== 'connected') {
      return NextResponse.json(
        {
          success: false,
          error: `Elasticsearch is not connected: ${health.message}`,
          health,
        },
        { status: 503 }
      );
    }

    const migrationResult = await migrateNotesIndex();
    return NextResponse.json(migrationResult, {
      status: migrationResult.success ? 200 : 500,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Index migration failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const health = await checkElasticsearchHealth();
  return NextResponse.json({
    elasticsearch: health,
    noteIndex: 'livo_notes',
  });
}
