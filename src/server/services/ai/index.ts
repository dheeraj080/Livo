import { GoogleGenAI } from '@google/genai';
import { config } from '@/src/server/lib/config';
import type { ServiceHealthStatus, AIActionRequest, AIActionResponse } from '@/src/types';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!config.gemini.isConfigured || !config.gemini.apiKey) {
    return null;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: config.gemini.apiKey,
    });
  }

  return aiClient;
}

export async function checkGeminiHealth(): Promise<ServiceHealthStatus> {
  if (!config.gemini.isConfigured || !config.gemini.apiKey) {
    return {
      name: 'Google Gemini AI',
      configured: false,
      status: 'unconfigured',
      message: 'GEMINI_API_KEY environment variable is not set',
    };
  }

  const startTime = Date.now();
  const client = getGeminiClient();

  if (!client) {
    return {
      name: 'Google Gemini AI',
      configured: true,
      status: 'disconnected',
      message: 'Failed to initialize GoogleGenAI client',
    };
  }

  try {
    // Perform a lightweight validation test
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping',
    });

    const latencyMs = Date.now() - startTime;
    if (response && response.text) {
      return {
        name: 'Google Gemini AI',
        configured: true,
        status: 'connected',
        latencyMs,
        message: `Connected using gemini-3.8-flash (${latencyMs}ms)`,
      };
    }

    return {
      name: 'Google Gemini AI',
      configured: true,
      status: 'error',
      message: 'Empty response received from Gemini API',
    };
  } catch (error: any) {
    return {
      name: 'Google Gemini AI',
      configured: true,
      status: 'error',
      message: error?.message || 'Gemini API call failed',
    };
  }
}

export async function processAIAction(request: AIActionRequest): Promise<AIActionResponse> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY.');
  }

  let prompt = '';
  switch (request.action) {
    case 'summarize':
      prompt = `You are livo AI, an expert knowledge management assistant. Provide a concise, high-impact summary (3-5 bullet points and a one-sentence takeaway) for the following note titled "${request.noteTitle || 'Untitled'}":\n\n${request.content}`;
      break;
    case 'outline':
      prompt = `Create a clean, well-structured hierarchical outline for expanding this note titled "${request.noteTitle || 'Untitled'}":\n\n${request.content}`;
      break;
    case 'action_items':
      prompt = `Extract all explicit and implicit actionable tasks, to-dos, and follow-ups from this note. Format as markdown checkboxes (- [ ] Task description):\n\n${request.content}`;
      break;
    case 'improve_writing':
      prompt = `Improve the clarity, vocabulary, and flow of the following text while preserving its core tone and meaning. Return only the revised text:\n\n${request.content}`;
      break;
    case 'custom_prompt':
      prompt = `${request.customPrompt || 'Analyze this content'}:\n\nNote Title: ${request.noteTitle || 'Untitled'}\nContent:\n${request.content}`;
      break;
    default:
      prompt = `Analyze this note and provide insights:\n\n${request.content}`;
  }

  const response = await client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
  });

  return {
    result: response.text || '',
    model: 'gemini-3.8-flash',
  };
}
