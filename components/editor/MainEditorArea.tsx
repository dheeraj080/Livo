'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore, useCallback } from 'react';
import {
  Pin,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar,
  Tag as TagIcon,
  Check,
  Loader2,
  AlertCircle,
  Save,
  RotateCcw,
  Paperclip,
  UploadCloud,
  Download,
  FileText,
  Image as ImageIcon,
  X,
  ExternalLink,
  MoreHorizontal,
  FolderInput,
  Edit3,
  Copy,
  Plus,
} from 'lucide-react';
import { TiptapEditor } from './TiptapEditor';
import { ContextualAIMenu } from '@/components/ai/ContextualAIMenu';
import type { Note, Notebook, Attachment } from '@/src/types';

const emptySubscribe = () => () => {};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface MainEditorAreaProps {
  note: Note | null;
  notebooks: Notebook[];
  onSaveNote: (
    noteId: string,
    payload: {
      title?: string;
      content_json?: Record<string, any>;
      content_text?: string;
      content?: string;
      plainText?: string;
      isPinned?: boolean;
    }
  ) => Promise<boolean>;
  onDeleteNote: (id: string) => void;
  onRestoreNote?: (id: string) => void;
  onOpenAI?: () => void;
  onOpenSearch: () => void;
  onRenameNote?: (note: Note) => void;
  onMoveNote?: (note: Note) => void;
  onManageTags?: (note: Note) => void;
  onDuplicateNote?: (note: Note) => void;
}

export function MainEditorArea({
  note,
  notebooks,
  onSaveNote,
  onDeleteNote,
  onRestoreNote,
  onOpenAI,
  onOpenSearch,
  onRenameNote,
  onMoveNote,
  onManageTags,
  onDuplicateNote,
}: MainEditorAreaProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Local editor states
  const [title, setTitle] = useState(note?.title || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [moreMenuOpen]);

  // Attachment state for the active note
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  // AI Suggestion states
  const [contextualAiOpen, setContextualAiOpen] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[] | null>(null);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSuggestTitle = async () => {
    if (!note) return;
    setIsAiSuggesting(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.content || title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to suggest title');
      setSuggestedTitle(data.result);
    } catch (err: any) {
      setAiError(err.message || 'AI suggestion failed');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!note) return;
    setIsAiSuggesting(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: note.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to suggest tags');
      setSuggestedTags(data.tags || []);
    } catch (err: any) {
      setAiError(err.message || 'AI suggestion failed');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const fetchAttachments = useCallback(async (noteId: string) => {
    try {
      setIsLoadingAttachments(true);
      const res = await fetch(`/api/notes/${noteId}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments || []);
      }
    } catch (err) {
      console.error('[MainEditorArea] Failed to fetch attachments:', err);
    } finally {
      setIsLoadingAttachments(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const activeId = note?.id;

    if (!activeId) {
      return;
    }

    const load = async () => {
      try {
        setIsLoadingAttachments(true);
        const res = await fetch(`/api/notes/${activeId}/attachments`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setAttachments(data.attachments || []);
        }
      } catch (err) {
        console.error('[MainEditorArea] Failed to fetch attachments:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingAttachments(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [note?.id]);

  const handleUploadAttachmentFile = async (file: File) => {
    if (!note) return;
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError('File exceeds 10MB limit.');
      return;
    }

    setIsUploadingAttachment(true);
    setAttachmentError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/notes/${note.id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed with status ${res.status}`);
      }

      await fetchAttachments(note.id);
    } catch (err: any) {
      setAttachmentError(err.message || 'Failed to upload attachment.');
    } finally {
      setIsUploadingAttachment(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!note) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      } else {
        const err = await res.json().catch(() => ({}));
        setAttachmentError(err.error || 'Failed to delete attachment.');
      }
    } catch (err: any) {
      setAttachmentError(err.message || 'Failed to delete attachment.');
    }
  };

  // Ref tracking pending unsaved changes so failures never drop user input
  const pendingChangesRef = useRef<{
    noteId: string;
    title: string;
    contentJson?: Record<string, any>;
    contentText?: string;
    html?: string;
  } | null>(null);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Cleanup pending timers on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Core save execution logic
  const executeSave = useCallback(async () => {
    if (!note || !pendingChangesRef.current || isSavingRef.current) {
      return;
    }

    const payloadToSave = { ...pendingChangesRef.current };
    if (payloadToSave.noteId !== note.id) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const success = await onSaveNote(note.id, {
        title: payloadToSave.title,
        content_json: payloadToSave.contentJson,
        content_text: payloadToSave.contentText,
        plainText: payloadToSave.contentText,
        content: payloadToSave.html || JSON.stringify(payloadToSave.contentJson || {}),
      });

      if (success) {
        // Only clear pending if it wasn't modified again during flight
        if (
          pendingChangesRef.current &&
          pendingChangesRef.current.noteId === payloadToSave.noteId &&
          pendingChangesRef.current.title === payloadToSave.title &&
          pendingChangesRef.current.contentJson === payloadToSave.contentJson
        ) {
          pendingChangesRef.current = null;
        }
        setSaveStatus('saved');
        // Reset to idle after 2.5 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === 'saved' ? 'idle' : current));
        }, 2500);
      } else {
        // Keep pendingChangesRef intact so changes are NOT lost!
        setSaveStatus('error');
      }
    } catch {
      // Keep pendingChangesRef intact so user data is safely preserved
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [note, onSaveNote]);

  // Debounced autosave scheduler
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      executeSave();
    }, 1000); // 1-second debounce
  }, [executeSave]);

  // Title change handler
  const handleTitleChange = (newTitle: string) => {
    if (!note) return;
    setTitle(newTitle);

    pendingChangesRef.current = {
      noteId: note.id,
      title: newTitle,
      contentJson: pendingChangesRef.current?.contentJson || note.contentJson,
      contentText: pendingChangesRef.current?.contentText || note.plainText || '',
      html: pendingChangesRef.current?.html || note.content,
    };

    scheduleAutosave();
  };

  // Content change handler from Tiptap editor
  const handleContentChange = (
    json: Record<string, any>,
    plainText: string,
    html: string
  ) => {
    if (!note) return;

    pendingChangesRef.current = {
      noteId: note.id,
      title: pendingChangesRef.current?.title || title,
      contentJson: json,
      contentText: plainText,
      html,
    };

    scheduleAutosave();
  };

  // Manual save handler (Triggered by Save button or Ctrl+S)
  const handleManualSave = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (pendingChangesRef.current) {
      executeSave();
    } else if (note) {
      // Re-save current state
      pendingChangesRef.current = {
        noteId: note.id,
        title,
        contentJson: note.contentJson,
        contentText: note.plainText,
        html: note.content,
      };
      executeSave();
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-stone-800">No Note Selected</h3>
        <p className="text-xs text-stone-500 max-w-sm mt-1">
          Select an existing note from the list or create a new note to start drafting your thoughts with Tiptap.
        </p>
      </div>
    );
  }

  const currentNotebook =
    notebooks.find((nb) => nb.id === note.notebookId) || notebooks[0] || null;

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      {/* Trashed Note Banner if deleted */}
      {note.isTrashed && (
        <div className="px-8 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-800 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>This note is in the Trash. Content is read-only until restored.</span>
          </div>
          {onRestoreNote && (
            <button
              id="editor-restore-btn"
              type="button"
              onClick={() => onRestoreNote(note.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Note</span>
            </button>
          )}
        </div>
      )}

      {/* Refined Document Header */}
      <header className="px-8 pt-7 pb-4 border-b border-stone-200 bg-white shrink-0">
        <div className="max-w-[800px] w-full mx-auto">
          {/* Note Title - Strongest visual element */}
          <div className="w-full">
            <input
              id="editor-note-title-input"
              type="text"
              value={title}
              disabled={note.isTrashed}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Note"
              className="w-full text-3xl sm:text-[32px] font-bold tracking-tight text-stone-900 bg-transparent border-0 outline-none ring-0 shadow-none p-0 placeholder-stone-300 disabled:opacity-75 leading-tight cursor-text focus:outline-none focus:ring-0 selection:bg-indigo-100"
            />
          </div>

          {/* Subtle Metadata & Actions Row: #Tags · Notebook and ✓ Saved ✦ AI ··· */}
          <div className="flex items-center justify-between gap-4 mt-2.5 pt-0.5 flex-wrap">
            {/* Subtle Metadata: #GettingStarted · Personal Brain */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-normal">
              {/* Tags */}
              {note.tags && note.tags.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {note.tags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onManageTags?.(note)}
                      className="hover:text-stone-800 transition-colors cursor-pointer text-stone-500 hover:underline font-normal"
                      title="Manage tags"
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onManageTags?.(note)}
                  className="hover:text-stone-800 transition-colors cursor-pointer text-stone-400 hover:underline font-normal"
                  title="Add tags"
                >
                  + Add tags
                </button>
              )}

              {/* Separator dot */}
              <span className="text-stone-300 font-normal select-none">·</span>

              {/* Notebook */}
              <button
                id="editor-notebook-badge"
                type="button"
                onClick={() => onMoveNote?.(note)}
                className="hover:text-stone-800 transition-colors cursor-pointer text-stone-500 hover:underline font-normal"
                title="Click to move to another notebook"
              >
                {currentNotebook ? currentNotebook.name : 'Personal Brain'}
              </button>
            </div>

            {/* Document Actions: ✓ Saved   ✦ AI   ··· */}
            <div className="flex items-center gap-3.5 ml-auto shrink-0">
              {/* Visible Save State */}
              {saveStatus === 'saving' ? (
                <span
                  id="editor-save-status-saving"
                  className="flex items-center gap-1.5 text-xs text-stone-400 font-medium animate-pulse select-none"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />
                  <span>Saving...</span>
                </span>
              ) : saveStatus === 'error' ? (
                <div
                  id="editor-save-status-failed"
                  className="flex items-center gap-1.5 text-xs text-rose-600 font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Save failed</span>
                  <button
                    type="button"
                    onClick={handleManualSave}
                    className="underline hover:text-rose-800 font-semibold ml-1 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <span
                  id="editor-save-status-saved"
                  className="flex items-center gap-1.5 text-xs text-stone-400 font-normal select-none"
                  title="All changes saved"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved</span>
                </span>
              )}

              {/* Existing Contextual "✦ AI" Button */}
              <div className="relative inline-block">
                <button
                  id="note-contextual-ai-btn"
                  type="button"
                  onClick={() => setContextualAiOpen((prev) => !prev)}
                  aria-haspopup="dialog"
                  aria-expanded={contextualAiOpen}
                  aria-label="Contextual note AI actions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {isAiSuggesting ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>✦ AI</span>
                </button>

                {/* Contextual AI Popover Dropdown */}
                <ContextualAIMenu
                  isOpen={contextualAiOpen}
                  onClose={() => setContextualAiOpen(false)}
                  noteTitle={title}
                  noteContent={pendingChangesRef.current?.contentText || note.plainText || note.content || ''}
                  onSuggestTitle={handleSuggestTitle}
                  onSuggestTags={handleSuggestTags}
                  isAiSuggesting={isAiSuggesting}
                  onInsertContent={(contentToInsert) => {
                    const htmlBlock = `<p></p><blockquote>${contentToInsert}</blockquote><p></p>`;
                    const newHtml = `${pendingChangesRef.current?.html || note.content || ''}${htmlBlock}`;
                    const newPlainText = `${pendingChangesRef.current?.contentText || note.plainText || ''}\n\n${contentToInsert}`;
                    pendingChangesRef.current = {
                      noteId: note.id,
                      title,
                      html: newHtml,
                      contentText: newPlainText,
                    };
                    onSaveNote(note.id, {
                      content: newHtml,
                      plainText: newPlainText,
                      content_text: newPlainText,
                    });
                  }}
                />
              </div>

              {/* Secondary Note Actions ("...") */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  id="editor-more-actions-btn"
                  type="button"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="More actions"
                  aria-expanded={moreMenuOpen}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {moreMenuOpen && (
                  <div
                    id="editor-more-actions-menu"
                    className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-30 animate-in fade-in zoom-in-95 text-xs text-stone-700"
                  >
                    {/* Timestamp info */}
                    <div className="px-3 py-1.5 text-[11px] text-stone-400 flex items-center gap-1.5 border-b border-stone-100">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span suppressHydrationWarning>
                        {isClient && note?.updatedAt
                          ? `Updated ${new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Updated recently'}
                      </span>
                    </div>

                    {/* Pin / Unpin (moved to secondary actions) */}
                    <button
                      id="editor-pin-toggle-btn"
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        onSaveNote(note.id, { isPinned: !note.isPinned });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                    >
                      <Pin
                        className="w-3.5 h-3.5 text-stone-500"
                        fill={note.isPinned ? 'currentColor' : 'none'}
                      />
                      <span>{note.isPinned ? 'Unpin Note' : 'Pin Note'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setAttachmentsModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-stone-500" />
                        <span>Manage Files</span>
                      </span>
                      {attachments.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-[10px]">
                          {attachments.length}
                        </span>
                      )}
                    </button>

                    {onManageTags && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onManageTags(note);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                      >
                        <TagIcon className="w-3.5 h-3.5 text-stone-500" />
                        <span>Manage Tags...</span>
                      </button>
                    )}

                    {onMoveNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onMoveNote(note);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                      >
                        <FolderInput className="w-3.5 h-3.5 text-stone-500" />
                        <span>Move to Notebook...</span>
                      </button>
                    )}

                    {onRenameNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onRenameNote(note);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                        <span>Rename Note...</span>
                      </button>
                    )}

                    {onDuplicateNote && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onDuplicateNote(note);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Duplicate Note</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        handleManualSave();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-100 text-left transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-stone-500" />
                      <span>Save Now (⌘S)</span>
                    </button>

                    <div className="h-[1px] bg-stone-200 my-1" />

                    {note.isTrashed && onRestoreNote ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onRestoreNote(note.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 text-amber-700 text-left transition-colors cursor-pointer font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Restore Note</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onDeleteNote(note.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-left transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Move to Trash</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Suggestions / Error banners if any */}
          {aiError && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {suggestedTitle && (
            <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-medium text-stone-700 truncate">Suggested Title: &ldquo;{suggestedTitle}&rdquo;</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    handleTitleChange(suggestedTitle);
                    setSuggestedTitle(null);
                  }}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors cursor-pointer"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestedTitle(null)}
                  className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {suggestedTags && suggestedTags.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="font-medium text-stone-700 shrink-0">Suggested Tags:</span>
                  {suggestedTags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuggestedTags(null);
                  }}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors cursor-pointer"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestedTags(null)}
                  className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tiptap Rich-Text Editor Core */}
      <div className="flex-1 min-h-0 flex flex-col">
        <TiptapEditor
          noteId={note.id}
          noteTitle={note.title}
          contentJson={note.contentJson}
          initialHtml={note.content}
          onChange={handleContentChange}
          onOpenAI={onOpenAI || (() => setContextualAiOpen((prev) => !prev))}
          onSaveManual={handleManualSave}
          onAttachmentAdded={() => fetchAttachments(note.id)}
          disabled={note.isTrashed}
        />
      </div>

      {/* Note Attachments Management Modal */}
      {attachmentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/75 shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span>Note Attachments ({attachments.length})</span>
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Keep documents, images, and files organized with this note
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttachmentsModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1">
              {attachmentError && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{attachmentError}</span>
                </div>
              )}

              {/* Upload Dropzone / Button */}
              <div className="mb-5">
                <input
                  ref={attachmentInputRef}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAttachmentFile(file);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingAttachment}
                  onClick={() => attachmentInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-2.5 text-stone-600 hover:text-indigo-600 text-xs font-medium disabled:opacity-50"
                >
                  {isUploadingAttachment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Uploading to S3 object storage...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload new file or image (Max 10MB)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Attachments List */}
              {isLoadingAttachments ? (
                <div className="py-8 flex items-center justify-center text-xs text-stone-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading attachments...</span>
                </div>
              ) : attachments.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  No attachments yet. Upload images or files using the button above or drag images directly into the note editor.
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => {
                    const isImg = att.mimeType.startsWith('image/');
                    const fileUrl =
                      att.presignedUrl ||
                      att.url ||
                      `/api/attachments/${att.id}/download`;

                    return (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50/50 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                            {isImg ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={fileUrl}
                                alt={att.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-stone-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-stone-800 truncate" title={att.filename}>
                              {att.filename}
                            </p>
                            <p className="text-[11px] text-stone-400">
                              {(att.size / 1024).toFixed(0)} KB • {att.mimeType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {/* Direct Download Button */}
                          <a
                            href={`/api/attachments/${att.id}/download?download=true`}
                            download={att.filename}
                            className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
                            title="Download Attachment from S3"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Attachment Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Attachment from S3 and Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50/50 text-[11px] text-stone-400 shrink-0">
              <span>Ownership verified: Only you have access to this note&apos;s files</span>
              <button
                type="button"
                onClick={() => setAttachmentsModalOpen(false)}
                className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
