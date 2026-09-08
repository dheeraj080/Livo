import { NextRequest, NextResponse } from 'next/server';
import { aiRequestSchema, handleAIAction } from '@/src/server/modules/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await handleAIAction(parsed.data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[livo API] AI Action error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process AI operation' },
      { status: 500 }
    );
  }
}
