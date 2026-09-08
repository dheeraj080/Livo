import { GoogleGenAI, Type } from '@google/genai';
import { config } from '@/src/server/lib/config';
import { AI_PROMPTS } from './prompts';

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!config.gemini.isConfigured || !config.gemini.apiKey) {
    throw new Error('Google Gemini API is not configured. Please provide GEMINI_API_KEY.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: config.gemini.apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

export class AiService {
  static async summarizeNote(note: { title?: string; content: string }): Promise<string> {
    const client = getAiClient();
    const prompt = AI_PROMPTS.summarizeNote(note.title || 'Untitled', note.content);
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || 'Unable to generate summary.';
  }

  static async generateNoteTitle(note: { content: string }): Promise<string> {
    const client = getAiClient();
    const prompt = AI_PROMPTS.generateNoteTitle(note.content);
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return (response.text || 'Untitled Note').trim().replace(/^["']|["']$/g, '');
  }

  static async generateTags(note: { title?: string; content: string }): Promise<string[]> {
    const client = getAiClient();
    const prompt = AI_PROMPTS.generateTags(note.title || 'Untitled', note.content);
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'A list of 3 to 6 relevant topical tags.',
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    try {
      const text = response.text?.trim() || '[]';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
      }
    } catch (e) {
      console.error('[AiService] Failed to parse tags JSON:', e);
    }
    return ['notes', 'ai-suggestion'];
  }

  static async rewriteText(text: string, instruction: string): Promise<string> {
    const client = getAiClient();
    const prompt = AI_PROMPTS.rewriteText(text, instruction);
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || text;
  }

  static async explainText(text: string): Promise<string> {
    const client = getAiClient();
    const prompt = AI_PROMPTS.explainText(text);
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || 'Unable to generate explanation.';
  }

  static async answerQuestion(question: string, context: string): Promise<string> {
    const client = getAiClient();
    const prompt = AI_PROMPTS.answerQuestion(question, context);
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    return response.text || 'Unable to answer question.';
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = getAiClient();
      const response = await client.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      const resAny = response as any;
      if (resAny.embedding?.values) {
        return resAny.embedding.values;
      }
      if (resAny.embeddings?.[0]?.values) {
        return resAny.embeddings[0].values;
      }
    } catch (error) {
      console.error('[AiService] generateEmbedding error:', error);
    }
    // Fallback 768-dim zero vector if unconfigured or error
    return new Array(768).fill(0);
  }
}
