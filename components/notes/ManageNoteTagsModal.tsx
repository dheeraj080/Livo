'use client';

import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, X, Check } from 'lucide-react';
import type { Note, Tag } from '@/src/types';

interface ManageNoteTagsModalProps {
  isOpen: boolean;
  note: Note | null;
  allTags: Tag[];
  onClose: () => void;
  onSaveTags: (noteId: string, selectedTagIds: string[]) => Promise<boolean | void>;
  onCreateTagQuick?: (name: string) => Promise<Tag | null>;
}

export function ManageNoteTagsModal({
  isOpen,
  note,
  allTags,
  onClose,
  onSaveTags,
  onCreateTagQuick,
}: ManageNoteTagsModalProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    if (isOpen && note) {
      setSelectedTagIds(note.tags ? note.tags.map((t) => t.id) : []);
      setNewTagName('');
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

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateNewTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagName.trim().replace(/^#/, '');
    if (!clean || !onCreateTagQuick) return;

    setCreatingTag(true);
    try {
      const created = await onCreateTagQuick(clean);
      if (created) {
        setSelectedTagIds((prev) => [...prev, created.id]);
        setNewTagName('');
      }
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaveTags(note.id, selectedTagIds);
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
            <TagIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-stone-900 text-sm">Manage Tags</h3>
          </div>
          <button
            id="manage-tags-close"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600">
            Select tags for &ldquo;<span className="font-medium text-stone-900">{note.title || 'Untitled Note'}</span>&rdquo;:
          </p>

          {/* Quick Create Tag Input */}
          {onCreateTagQuick && (
            <form onSubmit={handleCreateNewTag} className="flex gap-2">
              <input
                id="quick-add-tag-input"
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Add new tag..."
                className="flex-1 text-xs rounded-lg border border-stone-300 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                id="quick-add-tag-btn"
                type="submit"
                disabled={creatingTag || !newTagName.trim()}
                className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}

          {/* Tags list */}
          <div className="max-h-56 overflow-y-auto space-y-1 border border-stone-200 rounded-xl p-2 bg-stone-50/50">
            {allTags.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">No tags created yet.</p>
            ) : (
              allTags.map((tag) => {
                const isChecked = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    id={`tag-toggle-${tag.id}`}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium'
                        : 'hover:bg-white text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <TagIcon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: tag.color || '#6366f1' }}
                      />
                      <span className="truncate">#{tag.name}</span>
                    </div>
                    {isChecked && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="manage-tags-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              id="manage-tags-submit-btn"
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Apply Tags'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
