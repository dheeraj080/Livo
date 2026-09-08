'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import type { Notebook } from '@/src/types';

interface RenameNotebookModalProps {
  isOpen: boolean;
  notebook: Notebook | null;
  existingNames?: string[];
  onClose: () => void;
  onRename: (id: string, newName: string) => Promise<boolean | void>;
}

export function RenameNotebookModal({
  isOpen,
  notebook,
  existingNames = [],
  onClose,
  onRename,
}: RenameNotebookModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && notebook) {
      setName(notebook.name);
      setError(null);
    }
  }, [isOpen, notebook]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !notebook) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Notebook name cannot be empty.');
      return;
    }

    if (trimmed === notebook.name) {
      onClose();
      return;
    }

    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase() && n.toLowerCase() !== notebook.name.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A notebook named "${trimmed}" already exists.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRename(notebook.id, trimmed);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to rename notebook');
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
            <h3 className="font-semibold text-stone-900 text-sm">Rename Notebook</h3>
          </div>
          <button
            id="rename-notebook-close"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              id="rename-notebook-error"
              className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="rename-notebook-input" className="block text-xs font-semibold text-stone-700 mb-1">
              Notebook Name
            </label>
            <input
              id="rename-notebook-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work & Research"
              className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="rename-notebook-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="rename-notebook-submit-btn"
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
