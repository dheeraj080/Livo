'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import type { Notebook } from '@/src/types';

interface DeleteNotebookModalProps {
  isOpen: boolean;
  notebook: Notebook | null;
  noteCount: number;
  onClose: () => void;
  onConfirmDelete: (notebookId: string) => Promise<boolean | void>;
}

export function DeleteNotebookModal({
  isOpen,
  notebook,
  noteCount,
  onClose,
  onConfirmDelete,
}: DeleteNotebookModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

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

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirmDelete(notebook.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete notebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/75">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-semibold text-stone-900 text-sm">Delete Notebook</h3>
          </div>
          <button
            id="delete-notebook-close"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div
              id="delete-notebook-error"
              className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
            >
              {error}
            </div>
          )}

          <p className="text-xs text-stone-700">
            Are you sure you want to delete the notebook{' '}
            <strong className="text-stone-950 font-semibold">&ldquo;{notebook.name}&rdquo;</strong>?
          </p>

          {noteCount > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold">
                  This notebook currently contains {noteCount} note{noteCount === 1 ? '' : 's'}.
                </p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Your notes will <strong>not</strong> be deleted. They will be safely unassigned and remain accessible under &ldquo;All Notes&rdquo;.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              This notebook is empty. Deleting it will remove it from your sidebar.
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="delete-notebook-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="delete-notebook-confirm-btn"
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Notebook'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
