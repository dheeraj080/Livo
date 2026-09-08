import { z } from 'zod';
import { processAIAction } from '../../services/ai';
import { config } from '@/src/server/lib/config';
import type { AIActionRequest, AIActionResponse } from '@/src/types';

export const aiRequestSchema = z.object({
  action: z.enum(['summarize', 'outline', 'action_items', 'improve_writing', 'custom_prompt']),
  content: z.string().min(1, 'Content cannot be empty'),
  noteTitle: z.string().optional(),
  customPrompt: z.string().optional(),
});

export async function handleAIAction(input: AIActionRequest): Promise<AIActionResponse> {
  if (!config.gemini.isConfigured) {
    throw new Error('Google Gemini API is not configured. Please supply GEMINI_API_KEY.');
  }

  return processAIAction(input);
}
