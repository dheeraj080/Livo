'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, FolderInput, X, Check } from 'lucide-react';
import type { Note, Notebook } from '@/src/types';

interface MoveNoteModalProps {
  isOpen: boolean;
  note: Note | null;
  notebooks: Notebook[];
  onClose: () => void;
  onMove: (noteId: string, notebookId: string | null) => Promise<boolean | void>;
}

export function MoveNoteModal({
  isOpen,
  note,
  notebooks,
  onClose,
  onMove,
}: MoveNoteModalProps) {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && note) {
      setSelectedNotebookId(note.notebookId || null);
    }
  }, [isOpen, note]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onMove(note.id, selectedNotebookId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/75">
          <div className="flex items-center gap-2">
            <FolderInput className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-stone-900 text-sm">Move Note to Notebook</h3>
          </div>
          <button
            id="move-note-close"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-stone-600">
            Select the destination notebook for &ldquo;<span className="font-medium text-stone-900">{note.title || 'Untitled Note'}</span>&rdquo;:
          </p>

          <div className="max-h-60 overflow-y-auto space-y-1.5 border border-stone-200 rounded-xl p-2 bg-stone-50/50">
            {/* Unassigned / All Notes option */}
            <button
              id="move-note-dest-none"
              type="button"
              onClick={() => setSelectedNotebookId(null)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                selectedNotebookId === null
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium'
                  : 'hover:bg-white text-stone-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-stone-400" />
                <span>None (General / All Notes)</span>
              </div>
              {selectedNotebookId === null && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
            </button>

            {/* Notebook items */}
            {notebooks.map((nb) => {
              const isSelected = selectedNotebookId === nb.id;
              return (
                <button
                  key={nb.id}
                  id={`move-note-dest-${nb.id}`}
                  type="button"
                  onClick={() => setSelectedNotebookId(nb.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium'
                      : 'hover:bg-white text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <BookOpen
                      className="w-4 h-4 shrink-0"
                      style={{ color: nb.color || '#4f46e5' }}
                    />
                    <span className="truncate">{nb.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="move-note-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="move-note-submit-btn"
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Moving...' : 'Move Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
