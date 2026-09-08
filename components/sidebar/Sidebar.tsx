'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Cloud,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import type { Notebook, Tag } from '@/src/types';

interface SidebarProps {
  notebooks: Notebook[];
  tags: Tag[];
  selectedView: string;
  selectedNotebookId?: string;
  selectedTagId?: string;
  trashCount?: number;
  onSelectView: (view: 'all' | 'favorites' | 'trash') => void;
  onSelectNotebook: (notebookId: string) => void;
  onSelectTag: (tagId: string) => void;
  onCreateNote: () => void;
  onCreateNotebook: () => void;
  onRenameNotebook?: (notebook: Notebook) => void;
  onDeleteNotebook?: (notebook: Notebook) => void;
  onCreateTag?: () => void;
  onOpenSearch: () => void;
  onOpenAsklivo?: () => void;
  onOpenAskMyNotes?: () => void;
  onOpenAI?: () => void;
  onOpenHealth: () => void;
}

export function Sidebar({
  notebooks,
  tags,
  selectedView,
  selectedNotebookId,
  selectedTagId,
  trashCount = 0,
  onSelectView,
  onSelectNotebook,
  onSelectTag,
  onCreateNote,
  onCreateNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  onCreateTag,
  onOpenSearch,
  onOpenAsklivo,
  onOpenAskMyNotes,
  onOpenAI,
  onOpenHealth,
}: SidebarProps) {
  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [activeMenuNotebookId, setActiveMenuNotebookId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close context menu on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuNotebookId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuNotebookId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAsklivoClick = () => {
    if (onOpenAsklivo) {
      onOpenAsklivo();
    } else if (onOpenAskMyNotes) {
      onOpenAskMyNotes();
    } else if (onOpenAI) {
      onOpenAI();
    }
  };

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

        <div className="space-y-1.5 pt-0.5">
          <button
            id="sidebar-search-btn"
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 text-xs transition-colors"
            title="Search (Cmd+K)"
          >
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Search</span>
          </button>

          <button
            id="sidebar-ask-livo-btn"
            type="button"
            onClick={handleAsklivoClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-indigo-300 hover:text-white font-medium text-xs border border-indigo-500/30 transition-colors shadow-xs"
            title="Ask livo across your knowledge base"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Ask livo</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-stone-800/80" />

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
            {trashCount > 0 && (
              <span className="text-[10px] bg-stone-800/90 text-stone-400 px-1.5 py-0.5 rounded font-mono">
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Notebooks Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            <button
              id="sidebar-toggle-notebooks"
              type="button"
              onClick={() => setNotebooksOpen(!notebooksOpen)}
              className="flex items-center gap-1.5 hover:text-stone-200 cursor-pointer"
            >
              {notebooksOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Notebooks</span>
            </button>
            <button
              id="sidebar-add-notebook-btn"
              type="button"
              onClick={onCreateNotebook}
              className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Create Notebook"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {notebooksOpen && (
            <div className="pl-2 space-y-0.5 mt-1">
              {notebooks.length === 0 ? (
                <p className="text-[11px] text-stone-500 px-3 py-1">No notebooks yet</p>
              ) : (
                notebooks.map((nb) => {
                  const isSelected = selectedNotebookId === nb.id;
                  const isMenuOpen = activeMenuNotebookId === nb.id;
                  return (
                    <div
                      key={nb.id}
                      className={`group relative flex items-center justify-between rounded-md text-xs transition-colors ${
                        isSelected
                          ? 'bg-stone-800 text-white font-medium'
                          : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'
                      }`}
                    >
                      <button
                        id={`notebook-nav-${nb.id}`}
                        type="button"
                        onClick={() => {
                          onSelectNotebook(nb.id);
                          setActiveMenuNotebookId(null);
                        }}
                        className="flex-1 flex items-center gap-2 px-3 py-1.5 truncate text-left cursor-pointer"
                      >
                        <BookOpen
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: nb.color || '#6366f1' }}
                        />
                        <span className="truncate">{nb.name}</span>
                      </button>

                      <div className="flex items-center gap-1 pr-1.5">
                        {nb.noteCount !== undefined && nb.noteCount > 0 && !isMenuOpen && (
                          <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 group-hover:hidden">
                            {nb.noteCount}
                          </span>
                        )}

                        {/* Hover Context Menu Button (...) */}
                        <div className="relative">
                          <button
                            id={`notebook-menu-btn-${nb.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuNotebookId(isMenuOpen ? null : nb.id);
                            }}
                            className={`p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-700/60 transition-colors cursor-pointer ${
                              isMenuOpen ? 'opacity-100 bg-stone-700' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            title="Notebook actions"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Context Menu Dropdown */}
                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 w-36 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                              <button
                                id={`notebook-rename-btn-${nb.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNotebookId(null);
                                  if (onRenameNotebook) onRenameNotebook(nb);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-stone-400" />
                                <span>Rename</span>
                              </button>
                              <button
                                id={`notebook-delete-btn-${nb.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNotebookId(null);
                                  if (onDeleteNotebook) onDeleteNotebook(nb);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
              className="flex items-center gap-1.5 hover:text-stone-200 cursor-pointer"
            >
              {tagsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Tags</span>
            </button>
            <button
              id="sidebar-add-tag-btn"
              type="button"
              onClick={onCreateTag}
              className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Create Tag"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {tagsOpen && (
            <div className="pl-2 space-y-0.5 mt-1">
              {tags.length === 0 ? (
                <p className="text-[11px] text-stone-500 px-3 py-1">No tags defined</p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    id={`tag-nav-${tag.id}`}
                    type="button"
                    onClick={() => onSelectTag(tag.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      selectedTagId === tag.id
                        ? 'bg-stone-800 text-white font-medium'
                        : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TagIcon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: tag.color || '#9ca3af' }}
                      />
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
