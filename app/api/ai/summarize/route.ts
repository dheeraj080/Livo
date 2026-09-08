import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AiService } from '@/src/server/services/ai/ai.service';
import { checkRateLimit, rateLimitResponse } from '@/src/server/lib/rate-limiter';

const schema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!checkRateLimit(ip)) {
    return rateLimitResponse();
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.format() }, { status: 400 });
    }

    const summary = await AiService.summarizeNote(parsed.data);
    return NextResponse.json({ result: summary });
  } catch (error: any) {
    console.error('[API /api/ai/summarize] Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to summarize note' }, { status: 500 });
  }
}
