'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import type { Note } from '@/src/types';

interface RenameNoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onRename: (noteId: string, newTitle: string) => Promise<boolean | void>;
}

export function RenameNoteModal({
  isOpen,
  note,
  onClose,
  onRename,
}: RenameNoteModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && note) {
      setTitle(note.title || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;

    setLoading(true);
    try {
      await onRename(note.id, clean);
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
            <Pencil className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-stone-900 text-sm">Rename Note</h3>
          </div>
          <button
            id="rename-note-close"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="rename-note-title-input" className="block text-xs font-semibold text-stone-700 mb-1">
              Note Title
            </label>
            <input
              id="rename-note-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Architecture Plan"
              className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="rename-note-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="rename-note-submit-btn"
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Title'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
