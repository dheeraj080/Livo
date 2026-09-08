import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AiService } from '@/src/server/services/ai/ai.service';
import { checkRateLimit, rateLimitResponse } from '@/src/server/lib/rate-limiter';

const schema = z.object({
  text: z.string().min(1, 'Text is required'),
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

    const explanation = await AiService.explainText(parsed.data.text);
    return NextResponse.json({ result: explanation });
  } catch (error: any) {
    console.error('[API /api/ai/explain] Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to explain text' }, { status: 500 });
  }
}
