'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  FileText,
  Wand2,
  ListOrdered,
  CheckSquare,
  Send,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Tag as TagIcon,
  Heading,
  CornerDownLeft,
  ArrowLeft,
  PenTool,
} from 'lucide-react';
import type { AIActionRequest } from '@/src/types';

interface ContextualAIMenuProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle: string;
  noteContent: string;
  onSuggestTitle: () => void;
  onSuggestTags: () => void;
  isAiSuggesting?: boolean;
  onInsertContent?: (content: string) => void;
}

type MenuState = 'menu' | 'loading' | 'result';

export function ContextualAIMenu({
  isOpen,
  onClose,
  noteTitle,
  noteContent,
  onSuggestTitle,
  onSuggestTags,
  isAiSuggesting = false,
  onInsertContent,
}: ContextualAIMenuProps) {
  const [menuState, setMenuState] = useState<MenuState>('menu');
  const [activeActionName, setActiveActionName] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setMenuState('menu');
      setResult(null);
      setError(null);
      setActiveActionName('');
      setCustomPrompt('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Execute standard action via /api/ai/action
  const executeAction = async (action: AIActionRequest['action'], label: string, promptText?: string) => {
    setActiveActionName(label);
    setMenuState('loading');
    setError(null);
    setResult(null);

    try {
      const payload: AIActionRequest = {
        action,
        content: noteContent || 'No content provided in current note.',
        noteTitle: noteTitle || 'Untitled Note',
        customPrompt: promptText,
      };

      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI operation failed');
      }

      setResult(data.result);
      setMenuState('result');
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with livo AI');
      setMenuState('result');
    }
  };

  // Execute rewrite action via /api/ai/rewrite (Grammar, Tone, etc.)
  const executeRewrite = async (instruction: string, label: string) => {
    setActiveActionName(label);
    setMenuState('loading');
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: noteContent || 'No content provided in current note.',
          instruction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI rewrite failed');
      }

      setResult(data.result);
      setMenuState('result');
    } catch (err: any) {
      setError(err.message || 'Failed to rewrite note content');
      setMenuState('result');
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (result && onInsertContent) {
      onInsertContent(result);
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      id="contextual-ai-popover"
      role="dialog"
      aria-label="Contextual AI Menu"
      className="absolute top-full right-0 mt-2 z-40 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95"
    >
      {/* Popover Header */}
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {menuState !== 'menu' && (
            <button
              type="button"
              onClick={() => {
                setMenuState('menu');
                setResult(null);
                setError(null);
              }}
              className="p-1 -ml-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 transition-colors"
              title="Back to AI actions"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900">
              {menuState === 'menu'
                ? 'AI for this note'
                : activeActionName || 'AI Output'}
            </h4>
            <p className="text-[10px] text-stone-500 truncate max-w-[200px]">
              {noteTitle || 'Untitled Note'}
            </p>
          </div>
        </div>
        <button
          id="contextual-ai-close-btn"
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          aria-label="Close AI menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* State 1: Menu Choices */}
      {menuState === 'menu' && (
        <div className="p-3 max-h-[70vh] overflow-y-auto space-y-3.5 text-xs">
          {/* Ask About This Note (Input first for rapid interaction) */}
          <div className="space-y-1.5">
            <label htmlFor="ai-note-prompt-input" className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
              Ask about this note
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customPrompt.trim()) {
                  executeAction('custom_prompt', 'Note Answer', customPrompt.trim());
                }
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={customInputRef}
                id="ai-note-prompt-input"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Summarize into 3 bullet points..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50/60 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="ai-note-prompt-submit"
                type="submit"
                disabled={!customPrompt.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 shrink-0"
                title="Ask question"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Suggestions: Title & Tags */}
          <div className="space-y-1 border-t border-stone-100 pt-2.5">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block px-1 mb-1">
              Metadata Suggestions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="contextual-action-suggest-title"
                type="button"
                disabled={isAiSuggesting}
                onClick={() => {
                  onSuggestTitle();
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-colors text-stone-700 font-medium group disabled:opacity-50"
              >
                <Heading className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Suggest title</span>
              </button>

              <button
                id="contextual-action-suggest-tags"
                type="button"
                disabled={isAiSuggesting}
                onClick={() => {
                  onSuggestTags();
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-colors text-stone-700 font-medium group disabled:opacity-50"
              >
                <TagIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Suggest tags</span>
              </button>
            </div>
          </div>

          {/* Note Operations */}
          <div className="space-y-1 border-t border-stone-100 pt-2.5">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block px-1 mb-1">
              Writing & Content Actions
            </span>
            <div className="space-y-1">
              <button
                id="contextual-action-summarize"
                type="button"
                onClick={() => executeAction('summarize', 'Summarize Note')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 text-left text-stone-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-medium text-stone-800">Summarize</p>
                    <p className="text-[10px] text-stone-400">Key takeaways and bullet summary</p>
                  </div>
                </div>
                <CornerDownLeft className="w-3 h-3 text-stone-300" />
              </button>

              <button
                id="contextual-action-improve"
                type="button"
                onClick={() => executeAction('improve_writing', 'Improve Writing')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 text-left text-stone-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Wand2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-medium text-stone-800">Improve writing</p>
                    <p className="text-[10px] text-stone-400">Enhance vocabulary, flow, and clarity</p>
                  </div>
                </div>
                <CornerDownLeft className="w-3 h-3 text-stone-300" />
              </button>

              <button
                id="contextual-action-expand"
                type="button"
                onClick={() => executeAction('outline', 'Expand / Outline')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 text-left text-stone-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ListOrdered className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-medium text-stone-800">Expand</p>
                    <p className="text-[10px] text-stone-400">Generate structured outline & expansion</p>
                  </div>
                </div>
                <CornerDownLeft className="w-3 h-3 text-stone-300" />
              </button>

              <button
                id="contextual-action-grammar"
                type="button"
                onClick={() =>
                  executeRewrite(
                    'Fix all spelling, punctuation, and grammar mistakes while preserving original meaning and tone.',
                    'Fix Grammar'
                  )
                }
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 text-left text-stone-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PenTool className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-medium text-stone-800">Fix grammar</p>
                    <p className="text-[10px] text-stone-400">Correct typos, spelling, and phrasing</p>
                  </div>
                </div>
                <CornerDownLeft className="w-3 h-3 text-stone-300" />
              </button>

              <button
                id="contextual-action-tasks"
                type="button"
                onClick={() => executeAction('action_items', 'Extract Tasks')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-100 text-left text-stone-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-medium text-stone-800">Extract tasks</p>
                    <p className="text-[10px] text-stone-400">Turn actionable items into markdown checklists</p>
                  </div>
                </div>
                <CornerDownLeft className="w-3 h-3 text-stone-300" />
              </button>
            </div>
          </div>

          {/* Change Tone */}
          <div className="space-y-1.5 border-t border-stone-100 pt-2.5">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block px-1">
              Change Tone
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  executeRewrite(
                    'Rewrite in a polished, professional, executive business tone.',
                    'Professional Tone'
                  )
                }
                className="flex-1 py-1.5 px-2 rounded-md bg-stone-100 hover:bg-indigo-50 hover:text-indigo-700 text-stone-700 text-[11px] font-medium transition-colors text-center border border-stone-200/60"
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() =>
                  executeRewrite(
                    'Rewrite concisely, trimming unnecessary words while retaining critical information.',
                    'Concise Tone'
                  )
                }
                className="flex-1 py-1.5 px-2 rounded-md bg-stone-100 hover:bg-indigo-50 hover:text-indigo-700 text-stone-700 text-[11px] font-medium transition-colors text-center border border-stone-200/60"
              >
                Concise
              </button>
              <button
                type="button"
                onClick={() =>
                  executeRewrite(
                    'Rewrite in a warm, friendly, conversational tone.',
                    'Casual Tone'
                  )
                }
                className="flex-1 py-1.5 px-2 rounded-md bg-stone-100 hover:bg-indigo-50 hover:text-indigo-700 text-stone-700 text-[11px] font-medium transition-colors text-center border border-stone-200/60"
              >
                Casual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Loading */}
      {menuState === 'loading' && (
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <div>
            <p className="text-xs font-semibold text-stone-800">Processing with Gemini...</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{activeActionName}</p>
          </div>
        </div>
      )}

      {/* State 3: Result View */}
      {menuState === 'result' && (
        <div className="p-4 space-y-3">
          {error ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">AI Operation Notice</p>
                <p className="mt-0.5 text-[11px] text-rose-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-60 overflow-y-auto p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {onInsertContent && (
                  <button
                    id="contextual-ai-insert-btn"
                    type="button"
                    onClick={handleInsert}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-xs"
                  >
                    Insert into Note
                  </button>
                )}
                <button
                  id="contextual-ai-copy-btn"
                  type="button"
                  onClick={handleCopy}
                  className="py-1.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
