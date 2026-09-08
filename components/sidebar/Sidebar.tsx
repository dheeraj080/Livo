'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Search,
  Sparkles,
  FileText,
  Star,
  Trash2,
  ChevronDown,
  ChevronRight,
  Tag as TagIcon,
  Activity,
  FolderPlus,
  Cloud,
} from 'lucide-react';
import type { Notebook, Tag } from '@/src/types';

interface SidebarProps {
  notebooks: Notebook[];
  tags: Tag[];
  selectedView: string;
  selectedNotebookId?: string;
  selectedTagId?: string;
  onSelectView: (view: 'all' | 'favorites' | 'trash') => void;
  onSelectNotebook: (notebookId: string) => void;
  onSelectTag: (tagId: string) => void;
  onCreateNote: () => void;
  onCreateNotebook: () => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onOpenAskMyNotes: () => void;
  onOpenHealth: () => void;
}

export function Sidebar({
  notebooks,
  tags,
  selectedView,
  selectedNotebookId,
  selectedTagId,
  onSelectView,
  onSelectNotebook,
  onSelectTag,
  onCreateNote,
  onCreateNotebook,
  onOpenSearch,
  onOpenAI,
  onOpenAskMyNotes,
  onOpenHealth,
}: SidebarProps) {
  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col h-screen shrink-0 select-none border-r border-stone-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-stone-800 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/30">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight">livo</h1>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <button
          id="sidebar-new-note-btn"
          type="button"
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            id="sidebar-search-btn"
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 text-xs transition-colors"
            title="Search (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span>Search</span>
          </button>
          <button
            id="sidebar-ai-btn"
            type="button"
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 text-xs transition-colors"
            title="livo AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Assist</span>
          </button>
        </div>

        <button
          id="sidebar-ask-notes-btn"
          type="button"
          onClick={onOpenAskMyNotes}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-indigo-300 font-medium text-xs border border-indigo-500/30 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Ask My Notes (RAG)</span>
        </button>
      </div>

      {/* Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Core Views */}
        <div className="space-y-0.5">
          <button
            id="nav-all-notes"
            type="button"
            onClick={() => onSelectView('all')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedView === 'all' && !selectedNotebookId && !selectedTagId
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-stone-400" />
              <span>All Notes</span>
            </div>
          </button>

          <button
            id="nav-favorites"
            type="button"
            onClick={() => onSelectView('favorites')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedView === 'favorites'
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Pinned & Favorites</span>
            </div>
          </button>

          <button
            id="nav-trash"
            type="button"
            onClick={() => onSelectView('trash')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedView === 'trash'
                ? 'bg-stone-800 text-white font-semibold'
                : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-stone-500" />
              <span>Trash</span>
            </div>
          </button>
        </div>

        {/* Notebooks Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            <button
              id="sidebar-toggle-notebooks"
              type="button"
              onClick={() => setNotebooksOpen(!notebooksOpen)}
              className="flex items-center gap-1.5 hover:text-stone-200"
            >
              {notebooksOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Notebooks</span>
            </button>
            <button
              id="sidebar-add-notebook-btn"
              type="button"
              onClick={onCreateNotebook}
              className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              title="Create Notebook"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {notebooksOpen && (
            <div className="pl-2 space-y-0.5 mt-1">
              {notebooks.length === 0 ? (
                <p className="text-[11px] text-stone-400 px-3 py-1">No notebooks yet</p>
              ) : (
                notebooks.map((nb) => (
                  <button
                    key={nb.id}
                    id={`notebook-nav-${nb.id}`}
                    type="button"
                    onClick={() => onSelectNotebook(nb.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                      selectedNotebookId === nb.id
                        ? 'bg-stone-800 text-white font-medium'
                        : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{nb.name}</span>
                    </div>
                    {nb.noteCount !== undefined && nb.noteCount > 0 && (
                      <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">
                        {nb.noteCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            <button
              id="sidebar-toggle-tags"
              type="button"
              onClick={() => setTagsOpen(!tagsOpen)}
              className="flex items-center gap-1.5 hover:text-stone-200"
            >
              {tagsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Tags</span>
            </button>
          </div>

          {tagsOpen && (
            <div className="pl-2 space-y-0.5 mt-1">
              {tags.length === 0 ? (
                <p className="text-[11px] text-stone-400 px-3 py-1">No tags defined</p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    id={`tag-nav-${tag.id}`}
                    type="button"
                    onClick={() => onSelectTag(tag.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                      selectedTagId === tag.id
                        ? 'bg-stone-800 text-white font-medium'
                        : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TagIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    {tag.noteCount > 0 && (
                      <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">
                        {tag.noteCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      
    </aside>
  );
}
