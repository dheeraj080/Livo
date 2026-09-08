'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  Search,
  Pin,
  FileText,
  ArrowUpDown,
  Plus,
  MoreHorizontal,
  Pencil,
  FolderInput,
  Tag as TagIcon,
  Copy,
  Trash2,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import type { Note } from '@/src/types';

const emptySubscribe = () => () => {};

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  title: string;
  isTrashView?: boolean;
  onRenameNote?: (note: Note) => void;
  onMoveNote?: (note: Note) => void;
  onManageTags?: (note: Note) => void;
  onTogglePin?: (noteId: string) => void;
  onDuplicateNote?: (note: Note) => void;
  onDeleteNote?: (noteId: string) => void;
  onRestoreNote?: (noteId: string) => void;
  onPermanentDeleteNote?: (noteId: string) => void;
  onEmptyTrash?: () => void;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  title,
  isTrashView = false,
  onRenameNote,
  onMoveNote,
  onManageTags,
  onTogglePin,
  onDuplicateNote,
  onDeleteNote,
  onRestoreNote,
  onPermanentDeleteNote,
  onEmptyTrash,
}: NoteListProps) {
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');
  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Close context menu on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuNoteId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuNoteId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredNotes = notes
    .filter((n) => {
      if (!filterText.trim()) return true;
      const q = filterText.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        (n.plainText && n.plainText.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Keep pinned notes at the top unless in trash view
      if (!isTrashView) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-80 bg-stone-50 border-r border-stone-200 flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-stone-900 text-sm">{title}</h2>
          <span className="text-[11px] text-stone-500">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isTrashView ? (
            notes.length > 0 && onEmptyTrash && (
              <button
                id="notelist-empty-trash-btn"
                type="button"
                onClick={onEmptyTrash}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:text-white hover:bg-rose-600 rounded-md transition-colors cursor-pointer border border-rose-200 hover:border-transparent"
                title="Empty Trash permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty</span>
              </button>
            )
          ) : (
            <>
              <button
                id="notelist-sort-btn"
                type="button"
                onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')}
                className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
                title={`Sort by ${sortBy === 'updated' ? 'Title' : 'Date'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                id="notelist-new-btn"
                type="button"
                onClick={onCreateNote}
                className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="Create new note"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Input */}
      <div className="px-3 py-2 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-stone-100/80 border border-stone-200/60">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            id="notelist-filter-input"
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter notes..."
            className="w-full text-xs bg-transparent border-none outline-hidden text-stone-800 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Note Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-200/60">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-medium text-stone-600">
              {isTrashView ? 'Trash is empty' : 'No notes found'}
            </p>
            <p className="text-stone-400">
              {isTrashView
                ? 'Deleted notes will appear here.'
                : 'Click "+ New Note" to capture your thoughts.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            const isMenuOpen = activeMenuNoteId === note.id;
            return (
              <div
                key={note.id}
                id={`note-card-${note.id}`}
                onClick={() => onSelectNote(note)}
                className={`group relative p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-white border-l-4 border-indigo-600 shadow-xs'
                    : 'hover:bg-white/90 bg-stone-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    {note.isPinned && !isTrashView && (
                      <Pin className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
                    )}
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-stone-950' : 'text-stone-800'
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </h3>
                  </div>

                  {/* Note Card Menu Button (...) */}
                  <div className="relative shrink-0">
                    <button
                      id={`note-card-menu-btn-${note.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuNoteId(isMenuOpen ? null : note.id);
                      }}
                      className={`p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-200/80 transition-colors cursor-pointer ${
                        isMenuOpen ? 'opacity-100 bg-stone-200' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Note actions"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {/* Context Menu Dropdown */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs"
                      >
                        {!isTrashView ? (
                          <>
                            {onRenameNote && (
                              <button
                                id={`note-menu-rename-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onRenameNote(note);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-stone-400" />
                                <span>Rename</span>
                              </button>
                            )}

                            {onMoveNote && (
                              <button
                                id={`note-menu-move-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onMoveNote(note);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                              >
                                <FolderInput className="w-3.5 h-3.5 text-stone-400" />
                                <span>Move to notebook...</span>
                              </button>
                            )}

                            {onManageTags && (
                              <button
                                id={`note-menu-tags-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onManageTags(note);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                              >
                                <TagIcon className="w-3.5 h-3.5 text-stone-400" />
                                <span>Manage tags...</span>
                              </button>
                            )}

                            {onTogglePin && (
                              <button
                                id={`note-menu-pin-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onTogglePin(note.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                              >
                                <Pin className="w-3.5 h-3.5 text-amber-500" />
                                <span>{note.isPinned ? 'Unpin note' : 'Pin to top'}</span>
                              </button>
                            )}

                            {onDuplicateNote && (
                              <button
                                id={`note-menu-duplicate-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onDuplicateNote(note);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-stone-400" />
                                <span>Duplicate note</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-stone-100" />

                            {onDeleteNote && (
                              <button
                                id={`note-menu-trash-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onDeleteNote(note.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Move to Trash</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {onRestoreNote && (
                              <button
                                id={`note-menu-restore-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onRestoreNote(note.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Restore note</span>
                              </button>
                            )}

                            {onPermanentDeleteNote && (
                              <button
                                id={`note-menu-perm-delete-${note.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuNoteId(null);
                                  onPermanentDeleteNote(note.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete permanently</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {note.plainText || 'No additional text in this note...'}
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-1 text-[10px] text-stone-400">
                  <div className="flex items-center gap-2 truncate">
                    <span suppressHydrationWarning>
                      {isClient ? formatDate(note.updatedAt) : ''}
                    </span>
                    {note.notebookName && (
                      <span className="flex items-center gap-1 text-stone-500 truncate max-w-[90px]">
                        <BookOpen className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                        <span className="truncate">{note.notebookName}</span>
                      </span>
                    )}
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <span className="bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-600 truncate max-w-[100px]">
                      #{note.tags[0].name}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

