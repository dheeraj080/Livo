'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Database, ArrowRight, Loader2, Sparkles, Brain, Cpu, Layers } from 'lucide-react';
import type { SearchResultItem } from '@/src/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote?: (noteId: string) => void;
}

type SearchMode = 'hybrid' | 'keyword' | 'semantic';

export function SearchModal({ isOpen, onClose, onSelectNote }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [searchSource, setSearchSource] = useState<'elasticsearch' | 'database_fallback' | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent, overrideMode?: SearchMode) => {
    if (e) e.preventDefault();
    const activeQuery = query.trim();
    if (!activeQuery) return;

    const mode = overrideMode || searchMode;
    setLoading(true);
    setErrorNotice(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(activeQuery)}&searchMode=${mode}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorNotice(data.error || 'Elasticsearch query failed.');
        setResults([]);
        setSearchSource(null);
      } else {
        setResults(data.results || []);
        setSearchSource(data.source || null);
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Search request failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    if (query.trim()) {
      handleSearch(undefined, mode);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-start justify-center pt-24 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <form onSubmit={(e) => handleSearch(e)} className="flex items-center px-4 py-3.5 border-b border-stone-200">
          <Search className="w-5 h-5 text-stone-400 shrink-0 mr-3" />
          <input
            id="search-palette-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes across titles, text, and semantic chunks..."
            className="flex-1 text-sm bg-transparent border-none outline-hidden text-stone-800 placeholder-stone-400"
            autoFocus
          />
          {query && (
            <button
              id="search-clear-btn"
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setErrorNotice(null);
              }}
              className="p-1 text-stone-400 hover:text-stone-600 rounded mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="search-execute-btn"
            type="submit"
            disabled={loading || !query.trim()}
            className="px-3 py-1 bg-stone-900 text-white rounded-md text-xs font-medium hover:bg-stone-800 transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
          <button
            id="search-modal-close"
            type="button"
            onClick={onClose}
            className="ml-2 p-1 text-stone-400 hover:text-stone-600 rounded"
          >
            <span className="sr-only">Close</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-stone-400 bg-stone-100 border border-stone-200 rounded">
              ESC
            </kbd>
          </button>
        </form>

        {/* Search Mode Selector Bar */}
        <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">Retrieval Mode:</span>
          <div className="flex items-center gap-1 bg-stone-200/70 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => handleModeChange('keyword')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                searchMode === 'keyword' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-stone-500" />
              <span>Keyword</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('semantic')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                searchMode === 'semantic' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-indigo-500" />
              <span>Semantic</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('hybrid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                searchMode === 'hybrid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hybrid (RRF)</span>
            </button>
          </div>
        </div>

        {/* Results / Status Area */}
        <div className="max-h-96 overflow-y-auto p-4">
          {errorNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Elasticsearch Search Notice</p>
                <p className="mt-1 text-amber-800">{errorNotice}</p>
              </div>
            </div>
          )}

          {!errorNotice && results.length === 0 && !loading && (
            <div className="py-8 text-center text-xs text-stone-400">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-stone-300" />
              <p className="font-medium text-stone-600">Elasticsearch Hybrid & Semantic Retrieval</p>
              <p className="mt-1 text-stone-400">
                Choose between Keyword, Semantic, or Hybrid RRF search to find matching notes and snippets.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                  Matches ({results.length}) — Mode: <span className="capitalize text-stone-700 font-semibold">{searchMode}</span>
                </span>
                {searchSource && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    searchSource === 'elasticsearch'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {searchSource === 'elasticsearch' ? 'Elasticsearch Vector/BM25' : 'PostgreSQL DB'}
                  </span>
                )}
              </div>
              {results.map((r) => (
                <button
                  key={r.id}
                  id={`search-result-${r.id}`}
                  onClick={() => {
                    onSelectNote?.(r.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900 group-hover:text-indigo-600 truncate"
                        dangerouslySetInnerHTML={{ __html: r.title }}
                      />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0 font-mono">
                        Score: {r.score.toFixed(2)}
                      </span>
                    </div>
                    {r.snippet && (
                      <div
                        className="text-xs text-stone-500 mt-1 line-clamp-2 bg-stone-50 p-2 rounded-lg border border-stone-100"
                        dangerouslySetInnerHTML={{ __html: r.snippet }}
                      />
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-600 shrink-0 ml-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
