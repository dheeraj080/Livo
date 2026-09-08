'use client';

import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';

interface CreateTagModalProps {
  isOpen: boolean;
  existingTagNames?: string[];
  onClose: () => void;
  onCreateTag: (name: string, color?: string) => Promise<boolean | void>;
}

export function CreateTagModal({
  isOpen,
  existingTagNames = [],
  onClose,
  onCreateTag,
}: CreateTagModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#4b5563'];

  useEffect(() => {
    if (isOpen) {
      setName('');
      setColor('#4f46e5');
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim().replace(/^#/, '');
    if (!clean) {
      setError('Tag name cannot be empty.');
      return;
    }

    const isDuplicate = existingTagNames.some(
      (t) => t.toLowerCase() === clean.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A tag named "#${clean}" already exists.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onCreateTag(clean, color);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/75">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-stone-900 text-sm">Create New Tag</h3>
          </div>
          <button
            id="create-tag-close"
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
              id="create-tag-error"
              className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="create-tag-input" className="block text-xs font-semibold text-stone-700 mb-1">
              Tag Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs font-semibold">#</span>
              <input
                id="create-tag-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Projects, Ideas, MeetingNotes..."
                className="w-full text-xs rounded-lg border border-stone-300 pl-7 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Color Tag</label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-stone-800 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="create-tag-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="create-tag-submit-btn"
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
