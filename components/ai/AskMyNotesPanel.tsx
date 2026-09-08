'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, FileText, Loader2, ArrowUpRight, Lightbulb } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ noteId: string; title: string; chunkId: string }>;
  timestamp: string;
}

interface AsklivoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
}

export function AsklivoPanel({ isOpen, onClose, onSelectNote }: AsklivoPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        "Hello! I'm livo, your personal AI knowledge assistant. Ask me anything across your notes, search information, or compare ideas.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleAsk = async (queryText: string) => {
    const userQuestion = queryText.trim();
    if (!userQuestion || loading) return;

    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to query knowledge assistant');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer generated.',
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Notice: ${err?.message || 'Unable to connect with livo AI service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuery);
  };

  const suggestionPrompts = [
    'Summarize key themes across my notes',
    'Find actionable tasks and to-dos',
    'Compare my recent notes',
  ];

  return (
    <aside
      id="ask-livo-panel"
      aria-label="Ask livo Knowledge Assistant"
      className="w-80 md:w-96 border-l border-stone-200 bg-stone-50 flex flex-col h-full shadow-lg z-30 shrink-0"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-stone-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-stone-900">Ask livo</h2>
            <p className="text-[10px] text-stone-500">Knowledge Base Assistant</p>
          </div>
        </div>
        <button
          id="close-ask-livo-panel"
          onClick={onClose}
          aria-label="Close Ask livo panel"
          className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.role === 'user' ? 'bg-stone-900 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                msg.role === 'user'
                  ? 'bg-stone-900 text-white rounded-tr-xs'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Sources / Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Sources Referenced ({msg.sources.length})
                  </p>
                  <div className="space-y-1">
                    {msg.sources.map((src, idx) => (
                      <button
                        key={`${src.noteId}-${idx}`}
                        type="button"
                        onClick={() => onSelectNote(src.noteId)}
                        className="w-full text-left flex items-center justify-between p-1.5 rounded-lg bg-stone-50 hover:bg-indigo-50 text-stone-700 hover:text-indigo-700 transition-colors group border border-stone-100"
                        title="Open source note"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3 h-3 text-stone-400 group-hover:text-indigo-500 shrink-0" />
                          <span className="truncate font-medium">{src.title}</span>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:text-indigo-600 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className="block text-[9px] mt-1 text-right text-stone-400">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-stone-500">Searching your knowledge base & synthesizing answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested queries when short history */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 pb-2">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-indigo-500" />
            <span>Suggested Queries</span>
          </p>
          <div className="flex flex-col gap-1">
            {suggestionPrompts.map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAsk(promptText)}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-stone-700 transition-colors truncate"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
        <input
          ref={inputRef}
          id="ask-livo-input"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask livo across your notes..."
          className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 outline-hidden focus:border-indigo-500 focus:bg-white text-stone-800 placeholder-stone-400"
        />
        <button
          id="ask-livo-submit-btn"
          type="submit"
          disabled={loading || !inputQuery.trim()}
          aria-label="Send query"
          className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
}

// Alias for backwards compatibility if needed
export const AskMyNotesPanel = AsklivoPanel;
