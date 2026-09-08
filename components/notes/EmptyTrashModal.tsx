'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface EmptyTrashModalProps {
  isOpen: boolean;
  trashedCount: number;
  onClose: () => void;
  onConfirmEmpty: () => Promise<boolean | void>;
}

export function EmptyTrashModal({
  isOpen,
  trashedCount,
  onClose,
  onConfirmEmpty,
}: EmptyTrashModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEmpty = async () => {
    setLoading(true);
    try {
      await onConfirmEmpty();
      onClose();
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
            <h3 className="font-semibold text-stone-900 text-sm">Empty Trash</h3>
          </div>
          <button
            id="empty-trash-close"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <p className="font-semibold">
                Permanently delete all {trashedCount} note{trashedCount === 1 ? '' : 's'} in Trash?
              </p>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                This action cannot be undone. These notes will be completely removed from your database and search index.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="empty-trash-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="empty-trash-confirm-btn"
              type="button"
              onClick={handleEmpty}
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Emptying...' : 'Empty Trash'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
