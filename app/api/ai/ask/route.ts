import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/src/server/modules/auth';
import { searchService } from '@/src/server/services/search';
import { AiService } from '@/src/server/services/ai/ai.service';
import { logger } from '@/src/server/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // 1. Mandatory tenant authentication check
    const user = await getCurrentUser(req);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User authentication required for RAG assistant' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const userId = user.id.trim();
    const cleanQuestion = question.trim();

    // 2. Hybrid Elasticsearch retrieval strictly scoped to user_id
    const searchResponse = await searchService.hybridSearch(
      {
        userId,
        query: cleanQuestion,
        pageSize: 6,
        searchMode: 'hybrid',
      },
      1,
      6
    );

    const relevantChunks = searchResponse.results;

    if (!relevantChunks || relevantChunks.length === 0) {
      return NextResponse.json({
        answer: "The notes do not contain enough information to answer this question.",
        sources: [],
      });
    }

    // 3. Build context without sending entire DB
    const contextLines = relevantChunks.map((chunk, idx) => {
      const cleanTitle = chunk.title.replace(/<[^>]*>?/gm, '');
      return `[Source ${idx + 1}] Note ID: ${chunk.id}\nTitle: ${cleanTitle}\nSnippet: ${chunk.snippet}\n`;
    });

    const contextText = contextLines.join('\n---\n');

    const prompt = `
You are livo AI, an expert personal knowledge assistant. Answer the user's question accurately using ONLY the provided personal notes context below.

CRITICAL RULES:
1. Do not invent facts or extrapolate beyond the provided notes.
2. If the provided notes do not contain enough information to answer the question, state: "The notes do not contain enough information to answer this question."
3. Clearly distinguish retrieved facts from AI-generated interpretation or synthesis.
4. Reference source notes using [Source X] inline when citing facts.

USER QUESTION:
${cleanQuestion}

RELEVANT NOTES CONTEXT:
${contextText}
`;

    const rawAnswer = await AiService.answerQuestion(cleanQuestion, prompt);

    const sources = relevantChunks.map((chunk) => ({
      noteId: chunk.id,
      title: chunk.title.replace(/<[^>]*>?/gm, ''),
      chunkId: `${chunk.id}_chunk_0`,
    }));

    return NextResponse.json({
      answer: rawAnswer,
      sources,
    });
  } catch (error: any) {
    logger.error({ service: 'rag', event: 'ask_notes_failed', error });
    return NextResponse.json(
      { error: error?.message || 'Failed to process ask notes request' },
      { status: 500 }
    );
  }
}
