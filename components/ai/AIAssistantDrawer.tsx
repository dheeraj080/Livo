'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ListOrdered,
  CheckSquare,
  FileText,
  Wand2,
  Send,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { AIActionRequest, AIActionResponse } from '@/src/types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle: string;
  noteContent: string;
  onInsertContent?: (text: string) => void;
}

export function AIAssistantDrawer({
  isOpen,
  onClose,
  noteTitle,
  noteContent,
  onInsertContent,
}: AIAssistantDrawerProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const executeAction = async (action: AIActionRequest['action'], customText?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: AIActionRequest = {
        action,
        content: noteContent || 'No content provided in current note.',
        noteTitle: noteTitle || 'Untitled Note',
        customPrompt: customText,
      };

      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI generation failed');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with livo AI server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-stone-200 shadow-2xl z-50 flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">livo AI Assistant</h3>
            <p className="text-[11px] text-stone-500">Powered by Gemini server-side</p>
          </div>
        </div>
        <button
          id="ai-drawer-close"
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Quick Actions</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              id="ai-action-summarize"
              type="button"
              disabled={loading}
              onClick={() => executeAction('summarize')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-stone-700 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Summarize</span>
            </button>

            <button
              id="ai-action-outline"
              type="button"
              disabled={loading}
              onClick={() => executeAction('outline')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-stone-700 disabled:opacity-50"
            >
              <ListOrdered className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Generate Outline</span>
            </button>

            <button
              id="ai-action-tasks"
              type="button"
              disabled={loading}
              onClick={() => executeAction('action_items')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-stone-700 disabled:opacity-50"
            >
              <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Extract Tasks</span>
            </button>

            <button
              id="ai-action-improve"
              type="button"
              disabled={loading}
              onClick={() => executeAction('improve_writing')}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all text-xs font-medium text-stone-700 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Improve Flow</span>
            </button>
          </div>
        </div>

        {/* Custom Query Box */}
        <div className="space-y-2">
          <label htmlFor="ai-custom-prompt" className="text-xs font-medium text-stone-600">
            Ask anything about this note
          </label>
          <div className="relative">
            <textarea
              id="ai-custom-prompt"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Turn this note into a meeting recap email..."
              className="w-full text-xs rounded-lg border border-stone-300 p-3 pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-stone-400 resize-none"
            />
            <button
              id="ai-custom-submit"
              type="button"
              disabled={loading || !customPrompt.trim()}
              onClick={() => executeAction('custom_prompt', customPrompt)}
              className="absolute bottom-2.5 right-2.5 p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-8 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="text-xs font-medium text-stone-600">Reasoning with Gemini server-side...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI Request Notice</p>
              <p className="mt-0.5 text-amber-800">{error}</p>
            </div>
          </div>
        )}

        {/* Result Area */}
        {result && (
          <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-xs font-semibold text-stone-700">AI Output</span>
              <div className="flex items-center gap-1.5">
                <button
                  id="ai-copy-result"
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {result}
            </div>

            {onInsertContent && (
              <button
                id="ai-insert-result"
                type="button"
                onClick={() => onInsertContent(result)}
                className="w-full py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Insert into Note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
