'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Search, Pin, FileText, ArrowUpDown, Plus } from 'lucide-react';
import type { Note } from '@/src/types';

const emptySubscribe = () => () => {};

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  title: string;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  title,
}: NoteListProps) {
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
          <span className="text-[11px] text-stone-500">{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="notelist-sort-btn"
            type="button"
            onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')}
            className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
            title={`Sort by ${sortBy === 'updated' ? 'Title' : 'Date'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            id="notelist-new-btn"
            type="button"
            onClick={onCreateNote}
            className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
            title="Create new note"
          >
            <Plus className="w-4 h-4" />
          </button>
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
            placeholder="Filter list..."
            className="w-full text-xs bg-transparent border-none outline-hidden text-stone-800 placeholder-stone-400"
          />
        </div>
      </div>

      {/* Note Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-200/60">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-medium text-stone-600">No notes found</p>
            <p className="text-stone-400">Click &quot;+ New Note&quot; to capture your first thought.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            return (
              <div
                key={note.id}
                id={`note-card-${note.id}`}
                onClick={() => onSelectNote(note)}
                className={`p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-white border-l-4 border-indigo-600 shadow-xs'
                    : 'hover:bg-white/80 bg-stone-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <h3 className={`text-xs font-semibold truncate ${isSelected ? 'text-stone-950' : 'text-stone-800'}`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  {note.isPinned && (
                    <Pin className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
                  )}
                </div>

                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {note.plainText || 'No additional text in this note...'}
                </p>

                <div className="flex items-center justify-between mt-2.5 pt-1 text-[10px] text-stone-400">
                  <span suppressHydrationWarning>{isClient ? formatDate(note.updatedAt) : ''}</span>
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
