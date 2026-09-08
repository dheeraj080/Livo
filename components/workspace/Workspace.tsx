'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { NoteList } from '@/components/notes/NoteList';
import { MainEditorArea } from '@/components/editor/MainEditorArea';
import { SearchModal } from '@/components/search/SearchModal';
import { SystemHealthModal } from '@/components/health/SystemHealthModal';
import { CreateNotebookModal } from '@/components/notebooks/CreateNotebookModal';
import { RenameNotebookModal } from '@/components/notebooks/RenameNotebookModal';
import { DeleteNotebookModal } from '@/components/notebooks/DeleteNotebookModal';
import { CreateTagModal } from '@/components/tags/CreateTagModal';
import { MoveNoteModal } from '@/components/notes/MoveNoteModal';
import { ManageNoteTagsModal } from '@/components/notes/ManageNoteTagsModal';
import { RenameNoteModal } from '@/components/notes/RenameNoteModal';
import { EmptyTrashModal } from '@/components/notes/EmptyTrashModal';
import { AsklivoPanel } from '@/components/ai/AskMyNotesPanel';
import type { Note, Notebook, Tag } from '@/src/types';

// Fixed starter timestamp to ensure 100% deterministic SSR/CSR hydration
const INITIAL_DEMO_TIMESTAMP = '2026-09-05T12:00:00.000Z';

// Default starter note so the user can immediately experience Tiptap and livo AI
const INITIAL_DEMO_NOTE: Note = {
  id: 'note-welcome-01',
  title: 'Welcome to livo Knowledge Base',
  content: `
    <h1>Welcome to livo</h1>
    <p>livo is your personal AI-powered knowledge management engine inspired by Evernote and Notion.</p>
    <h2>What's under the hood</h2>
    <ul>
      <li><strong>PostgreSQL + Drizzle ORM:</strong> Relational storage for structured notes, notebooks, and tags</li>
      <li><strong>Elasticsearch:</strong> Full-text BM25 indexation with fuzzy search</li>
      <li><strong>S3 / MinIO:</strong> Object storage for file attachments and media assets</li>
      <li><strong>Redis + BullMQ:</strong> Asynchronous background indexing queue</li>
      <li><strong>Google Gemini AI:</strong> Server-side summarization, outline generation, and text refinement</li>
      <li><strong>Tiptap:</strong> Modern headless rich-text editing engine</li>
    </ul>
    <blockquote>Use the <strong>✦ AI</strong> button in the note header to summarize, extract tasks, or refine content, and use <strong>✦ Ask livo</strong> in the sidebar to search and question your knowledge base.</blockquote>
  `,
  plainText: 'Welcome to livo. livo is your personal AI-powered knowledge management engine inspired by Evernote and Notion.',
  isPinned: true,
  isArchived: false,
  isTrashed: false,
  notebookId: 'nb-primary',
  tags: [{ id: 'tag-1', name: 'GettingStarted', color: '#4f46e5', noteCount: 1 }],
  createdAt: INITIAL_DEMO_TIMESTAMP,
  updatedAt: INITIAL_DEMO_TIMESTAMP,
};

interface WorkspaceProps {
  initialNoteId?: string;
}

export default function Workspace({ initialNoteId }: WorkspaceProps) {
  const [notes, setNotes] = useState<Note[]>([INITIAL_DEMO_NOTE]);
  const [activeNote, setActiveNote] = useState<Note | null>(INITIAL_DEMO_NOTE);
  const [notebooks, setNotebooks] = useState<Notebook[]>([
    {
      id: 'nb-primary',
      name: 'Personal Brain',
      description: 'Central knowledge repository',
      color: '#4f46e5',
      noteCount: 1,
      createdAt: INITIAL_DEMO_TIMESTAMP,
      updatedAt: INITIAL_DEMO_TIMESTAMP,
    },
  ]);
  const [tags, setTags] = useState<Tag[]>([
    { id: 'tag-1', name: 'GettingStarted', color: '#4f46e5', noteCount: 1 },
    { id: 'tag-2', name: 'Architecture', color: '#059669', noteCount: 0 },
  ]);

  const [selectedView, setSelectedView] = useState<'all' | 'favorites' | 'trash'>('all');
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | undefined>();
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>();

  // Modals & Panels state
  const [searchOpen, setSearchOpen] = useState(false);
  const [asklivoOpen, setAsklivoOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [createNotebookOpen, setCreateNotebookOpen] = useState(false);
  const [renameNotebook, setRenameNotebook] = useState<Notebook | null>(null);
  const [deleteNotebook, setDeleteNotebook] = useState<Notebook | null>(null);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [moveNote, setMoveNote] = useState<Note | null>(null);
  const [manageTagsNote, setManageTagsNote] = useState<Note | null>(null);
  const [renameNote, setRenameNote] = useState<Note | null>(null);
  const [emptyTrashOpen, setEmptyTrashOpen] = useState(false);

  // Sync with real REST API endpoints on initial mount or when initialNoteId changes
  useEffect(() => {
    let active = true;

    Promise.all([
      fetch('/api/notes').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/notebooks').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/tags').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([notesData, nbData, tagsData]) => {
      if (!active) return;
      if (notesData?.notes && notesData.notes.length > 0) {
        setNotes(notesData.notes);
        if (initialNoteId) {
          const matched = notesData.notes.find((n: Note) => n.id === initialNoteId);
          if (matched) {
            setActiveNote(matched);
          } else {
            // If requested note isn't in recent list, fetch directly
            fetch(`/api/notes/${initialNoteId}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((singleNote) => {
                if (singleNote && active) {
                  setNotes((prev) => [singleNote, ...prev.filter((n) => n.id !== singleNote.id)]);
                  setActiveNote(singleNote);
                } else if (active) {
                  setActiveNote(notesData.notes[0]);
                }
              })
              .catch(() => {
                if (active) setActiveNote(notesData.notes[0]);
              });
          }
        } else {
          setActiveNote(notesData.notes[0]);
        }
      } else if (initialNoteId) {
        fetch(`/api/notes/${initialNoteId}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((singleNote) => {
            if (singleNote && active) {
              setNotes([singleNote]);
              setActiveNote(singleNote);
            }
          })
          .catch(() => null);
      }

      if (nbData?.notebooks && nbData.notebooks.length > 0) {
        setNotebooks(nbData.notebooks);
      }
      if (tagsData?.tags && tagsData.tags.length > 0) {
        setTags(tagsData.tags);
      }
    });

    return () => {
      active = false;
    };
  }, [initialNoteId]);

  // Create Note handler with canonical Tiptap JSON document
  const handleCreateNote = async () => {
    const initialTiptapDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Start typing your knowledge notes with Tiptap...',
            },
          ],
        },
      ],
    };

    const newNoteData = {
      title: 'Untitled Note',
      content_json: initialTiptapDoc,
      content_text: 'Start typing your knowledge notes with Tiptap...',
      content: '<p>Start typing your knowledge notes with Tiptap...</p>',
      plainText: 'Start typing your knowledge notes with Tiptap...',
      notebookId: selectedNotebookId,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      tagIds: [],
    };

    // Try posting to real backend API
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteData),
      });
      if (res.ok) {
        const created: Note = await res.json();
        setNotes((prev) => [created, ...prev]);
        setActiveNote(created);
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', `/app/notes/${created.id}`);
        }
        return;
      }
    } catch (err) {
      console.warn('[livo API] Using client-buffered note session:', err);
    }

    // Client session fallback
    const fallbackNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      contentJson: initialTiptapDoc,
      contentText: 'Start typing your knowledge notes with Tiptap...',
      content: '<p>Start typing your knowledge notes with Tiptap...</p>',
      plainText: 'Start typing your knowledge notes with Tiptap...',
      notebookId: selectedNotebookId,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [fallbackNote, ...prev]);
    setActiveNote(fallbackNote);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/app/notes/${fallbackNote.id}`);
    }
  };

  // Save Note handler for both debounced autosave and manual save
  const handleSaveNote = async (
    noteId: string,
    payload: {
      title?: string;
      content_json?: Record<string, any>;
      content_text?: string;
      content?: string;
      plainText?: string;
      isPinned?: boolean;
    }
  ): Promise<boolean> => {
    // 1. Immediately update local client state
    const nowIso = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            ...payload,
            contentJson: payload.content_json || n.contentJson,
            contentText: payload.content_text || n.contentText,
            title: payload.title !== undefined ? payload.title : n.title,
            isPinned: payload.isPinned !== undefined ? payload.isPinned : n.isPinned,
            updatedAt: nowIso,
          };
        }
        return n;
      })
    );

    setActiveNote((curr) => {
      if (!curr || curr.id !== noteId) return curr;
      return {
        ...curr,
        ...payload,
        contentJson: payload.content_json || curr.contentJson,
        contentText: payload.content_text || curr.contentText,
        title: payload.title !== undefined ? payload.title : curr.title,
        isPinned: payload.isPinned !== undefined ? payload.isPinned : curr.isPinned,
        updatedAt: nowIso,
      };
    });

    // 2. Persist to PostgreSQL backend via PATCH /api/notes/[id]
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const persisted = await res.json();
        if (persisted && persisted.updatedAt) {
          setActiveNote((curr) => (curr && curr.id === noteId ? { ...curr, updatedAt: persisted.updatedAt } : curr));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[livo API] Save request network error:', err);
      return false;
    }
  };

  // Delete Note handler (soft deletion to trash)
  const handleDeleteNote = async (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrashed: true, deletedAt: new Date().toISOString() } : n))
    );

    if (activeNote?.id === id) {
      const remaining = notes.filter((n) => n.id !== id && !n.isTrashed);
      setActiveNote(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[livo API] Delete note request:', err);
    }
  };

  // Restore Note handler (restore from trash)
  const handleRestoreNote = async (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrashed: false, deletedAt: null } : n))
    );

    setActiveNote((curr) =>
      curr && curr.id === id ? { ...curr, isTrashed: false, deletedAt: null } : curr
    );

    try {
      await fetch(`/api/notes/${id}/restore`, { method: 'POST' });
    } catch (err) {
      console.warn('[livo API] Restore note request:', err);
    }
  };

  // Create Notebook handler
  const handleCreateNotebook = async (name: string, description?: string, color?: string) => {
    try {
      const res = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      });
      if (res.ok) {
        const created: Notebook = await res.json();
        setNotebooks((prev) => [created, ...prev]);
        setSelectedNotebookId(created.id);
        return;
      }
    } catch {
      // Fallback
    }

    const fallback: Notebook = {
      id: `nb-${Date.now()}`,
      name,
      description,
      color: color || '#4f46e5',
      noteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotebooks((prev) => [fallback, ...prev]);
    setSelectedNotebookId(fallback.id);
  };

  // Rename Notebook handler
  const handleRenameNotebook = async (id: string, newName: string) => {
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === id ? { ...nb, name: newName, updatedAt: new Date().toISOString() } : nb))
    );
    setNotes((prev) =>
      prev.map((n) => (n.notebookId === id ? { ...n, notebookName: newName } : n))
    );
    if (activeNote?.notebookId === id) {
      setActiveNote((curr) => (curr ? { ...curr, notebookName: newName } : curr));
    }

    try {
      await fetch(`/api/notebooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
    } catch (err) {
      console.warn('[livo API] Rename notebook failed:', err);
    }
  };

  // Delete Notebook handler (unassigns notes, does NOT delete them)
  const handleDeleteNotebook = async (id: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    setNotes((prev) =>
      prev.map((n) => (n.notebookId === id ? { ...n, notebookId: undefined, notebookName: undefined } : n))
    );
    if (activeNote?.notebookId === id) {
      setActiveNote((curr) => (curr ? { ...curr, notebookId: undefined, notebookName: undefined } : curr));
    }
    if (selectedNotebookId === id) {
      setSelectedNotebookId(undefined);
      setSelectedView('all');
    }

    try {
      await fetch(`/api/notebooks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[livo API] Delete notebook failed:', err);
    }
  };

  // Create Tag handler
  const handleCreateTag = async (name: string, color?: string) => {
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color: color || '#6366f1' }),
      });
      if (res.ok) {
        const created: Tag = await res.json();
        setTags((prev) => [...prev, created]);
        return;
      }
    } catch (err) {
      console.warn('[livo API] Create tag failed:', err);
    }

    const fallback: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color: color || '#6366f1',
      noteCount: 0,
      createdAt: new Date().toISOString(),
    };
    setTags((prev) => [...prev, fallback]);
  };

  // Move Note handler
  const handleMoveNote = async (noteId: string, targetNotebookId: string | null) => {
    const targetNb = targetNotebookId ? notebooks.find((nb) => nb.id === targetNotebookId) : null;
    const targetNotebookName = targetNb ? targetNb.name : undefined;

    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              notebookId: targetNotebookId || undefined,
              notebookName: targetNotebookName,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );

    if (activeNote?.id === noteId) {
      setActiveNote((curr) =>
        curr
          ? {
              ...curr,
              notebookId: targetNotebookId || undefined,
              notebookName: targetNotebookName,
              updatedAt: new Date().toISOString(),
            }
          : curr
      );
    }

    try {
      await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId: targetNotebookId }),
      });
    } catch (err) {
      console.warn('[livo API] Move note failed:', err);
    }
  };

  // Manage Note Tags handler
  const handleManageNoteTags = async (noteId: string, tagIds: string[]) => {
    const assignedTags = tags.filter((t) => tagIds.includes(t.id));

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, tags: assignedTags, updatedAt: new Date().toISOString() } : n))
    );
    if (activeNote?.id === noteId) {
      setActiveNote((curr) => (curr ? { ...curr, tags: assignedTags, updatedAt: new Date().toISOString() } : curr));
    }

    try {
      await fetch(`/api/notes/${noteId}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds }),
      });
    } catch (err) {
      console.warn('[livo API] Update tags failed:', err);
    }
  };

  // Duplicate Note handler
  const handleDuplicateNote = async (sourceNote: Note) => {
    const copyTitle = `${sourceNote.title} (Copy)`;
    const copyData = {
      title: copyTitle,
      content_json: sourceNote.contentJson,
      content_text: sourceNote.contentText || sourceNote.plainText,
      content: sourceNote.content,
      plainText: sourceNote.plainText,
      notebookId: sourceNote.notebookId,
      isPinned: false,
      isArchived: false,
      isTrashed: false,
      tagIds: sourceNote.tags?.map((t) => t.id) || [],
    };

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyData),
      });
      if (res.ok) {
        const created: Note = await res.json();
        setNotes((prev) => [created, ...prev]);
        setActiveNote(created);
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', `/app/notes/${created.id}`);
        }
        return;
      }
    } catch (err) {
      console.warn('[livo API] Duplicate note fallback:', err);
    }

    const fallback: Note = {
      ...sourceNote,
      id: `note-${Date.now()}`,
      title: copyTitle,
      isPinned: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [fallback, ...prev]);
    setActiveNote(fallback);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/app/notes/${fallback.id}`);
    }
  };

  // Toggle Pin handler
  const handleTogglePin = (noteId: string) => {
    const target = notes.find((n) => n.id === noteId);
    if (target) {
      handleSaveNote(noteId, { isPinned: !target.isPinned });
    }
  };

  // Permanent Delete Note handler
  const handlePermanentDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote?.id === id) {
      const remaining = notes.filter((n) => n.id !== id && !n.isTrashed);
      setActiveNote(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      await fetch(`/api/notes/${id}?permanent=true`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[livo API] Permanent delete note error:', err);
    }
  };

  // Empty Trash handler
  const handleEmptyTrash = async () => {
    const trashedIds = notes.filter((n) => n.isTrashed).map((n) => n.id);
    setNotes((prev) => prev.filter((n) => !n.isTrashed));
    if (activeNote?.isTrashed) {
      const remaining = notes.filter((n) => !n.isTrashed);
      setActiveNote(remaining.length > 0 ? remaining[0] : null);
    }

    for (const id of trashedIds) {
      try {
        await fetch(`/api/notes/${id}?permanent=true`, { method: 'DELETE' });
      } catch {
        // Continue emptying
      }
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n' && !isInput) {
        e.preventDefault();
        handleCreateNote();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j' && !isInput) {
        e.preventDefault();
        setAsklivoOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotebookId]);

  // Dynamic live accurate counts
  const notebooksWithLiveCounts = notebooks.map((nb) => ({
    ...nb,
    noteCount: notes.filter((n) => !n.isTrashed && n.notebookId === nb.id).length,
  }));

  const tagsWithLiveCounts = tags.map((t) => ({
    ...t,
    noteCount: notes.filter((n) => !n.isTrashed && n.tags?.some((tag) => tag.id === t.id)).length,
  }));

  const trashCount = notes.filter((n) => n.isTrashed).length;

  // Filter notes according to selected navigation view
  const visibleNotes = notes.filter((n) => {
    if (selectedView === 'trash') return n.isTrashed;
    if (n.isTrashed) return false;
    if (selectedView === 'favorites') return n.isPinned;
    if (selectedNotebookId) return n.notebookId === selectedNotebookId;
    if (selectedTagId) return n.tags?.some((t) => t.id === selectedTagId);
    return true;
  });

  const getListTitle = () => {
    if (selectedNotebookId) {
      const nb = notebooks.find((n) => n.id === selectedNotebookId);
      return nb ? nb.name : 'Notebook Notes';
    }
    if (selectedTagId) {
      const tg = tags.find((t) => t.id === selectedTagId);
      return tg ? `#${tg.name}` : 'Tagged Notes';
    }
    if (selectedView === 'favorites') return 'Pinned & Favorites';
    if (selectedView === 'trash') return 'Trash';
    return 'All Notes';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-stone-900 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        notebooks={notebooksWithLiveCounts}
        tags={tagsWithLiveCounts}
        selectedView={selectedView}
        selectedNotebookId={selectedNotebookId}
        selectedTagId={selectedTagId}
        trashCount={trashCount}
        onSelectView={(view) => {
          setSelectedView(view);
          setSelectedNotebookId(undefined);
          setSelectedTagId(undefined);
        }}
        onSelectNotebook={(nbId) => {
          setSelectedNotebookId(nbId);
          setSelectedTagId(undefined);
          setSelectedView('all');
        }}
        onSelectTag={(tagId) => {
          setSelectedTagId(tagId);
          setSelectedNotebookId(undefined);
          setSelectedView('all');
        }}
        onCreateNote={handleCreateNote}
        onCreateNotebook={() => setCreateNotebookOpen(true)}
        onRenameNotebook={(nb) => setRenameNotebook(nb)}
        onDeleteNotebook={(nb) => setDeleteNotebook(nb)}
        onCreateTag={() => setCreateTagOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAsklivo={() => setAsklivoOpen(true)}
        onOpenHealth={() => setHealthModalOpen(true)}
      />

      {/* 2. Note List Column */}
      <NoteList
        notes={visibleNotes}
        selectedNoteId={activeNote?.id}
        onSelectNote={(note) => {
          setActiveNote(note);
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', `/app/notes/${note.id}`);
          }
        }}
        onCreateNote={handleCreateNote}
        onRenameNote={(note) => setRenameNote(note)}
        onMoveNote={(note) => setMoveNote(note)}
        onManageTags={(note) => setManageTagsNote(note)}
        onDuplicateNote={handleDuplicateNote}
        onTogglePin={handleTogglePin}
        onDeleteNote={handleDeleteNote}
        onRestoreNote={handleRestoreNote}
        onPermanentDeleteNote={handlePermanentDeleteNote}
        onEmptyTrash={() => setEmptyTrashOpen(true)}
        title={getListTitle()}
      />

      {/* 3. Main Editor Area with Tiptap */}
      <MainEditorArea
        key={activeNote?.id || 'none'}
        note={activeNote}
        notebooks={notebooks}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
        onRestoreNote={handleRestoreNote}
        onRenameNote={(note) => setRenameNote(note)}
        onMoveNote={(note) => setMoveNote(note)}
        onManageTags={(note) => setManageTagsNote(note)}
        onDuplicateNote={handleDuplicateNote}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* 4. Global AI Knowledge Assistant Panel ("Ask livo") */}
      <AsklivoPanel
        isOpen={asklivoOpen}
        onClose={() => setAsklivoOpen(false)}
        onSelectNote={(noteId) => {
          const match = notes.find((n) => n.id === noteId);
          if (match) {
            setActiveNote(match);
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', `/app/notes/${match.id}`);
            }
          }
        }}
      />

      {/* 5. Search Palette Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectNote={(noteId) => {
          const match = notes.find((n) => n.id === noteId);
          if (match) {
            setActiveNote(match);
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', `/app/notes/${match.id}`);
            }
          }
        }}
      />

      {/* 6. System Health Diagnostic Modal */}
      <SystemHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />

      {/* 7. Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={createNotebookOpen}
        onClose={() => setCreateNotebookOpen(false)}
        onCreate={handleCreateNotebook}
        existingNames={notebooks.map((nb) => nb.name)}
      />

      {/* 8. Rename Notebook Modal */}
      <RenameNotebookModal
        isOpen={!!renameNotebook}
        notebook={renameNotebook}
        onClose={() => setRenameNotebook(null)}
        onRename={handleRenameNotebook}
        existingNames={notebooks.filter((nb) => nb.id !== renameNotebook?.id).map((nb) => nb.name)}
      />

      {/* 9. Delete Notebook Modal */}
      <DeleteNotebookModal
        isOpen={!!deleteNotebook}
        notebook={deleteNotebook}
        onClose={() => setDeleteNotebook(null)}
        onConfirmDelete={handleDeleteNotebook}
        noteCount={deleteNotebook ? notes.filter((n) => !n.isTrashed && n.notebookId === deleteNotebook.id).length : 0}
      />

      {/* 10. Create Tag Modal */}
      <CreateTagModal
        isOpen={createTagOpen}
        onClose={() => setCreateTagOpen(false)}
        onCreateTag={handleCreateTag}
        existingTagNames={tags.map((t) => t.name)}
      />

      {/* 11. Move Note Modal */}
      <MoveNoteModal
        isOpen={!!moveNote}
        note={moveNote}
        notebooks={notebooks}
        onClose={() => setMoveNote(null)}
        onMove={handleMoveNote}
      />

      {/* 12. Manage Note Tags Modal */}
      <ManageNoteTagsModal
        isOpen={!!manageTagsNote}
        note={manageTagsNote}
        allTags={tags}
        onClose={() => setManageTagsNote(null)}
        onSaveTags={handleManageNoteTags}
        onCreateTagQuick={async (name) => {
          await handleCreateTag(name);
          return null;
        }}
      />

      {/* 13. Rename Note Modal */}
      <RenameNoteModal
        isOpen={!!renameNote}
        note={renameNote}
        onClose={() => setRenameNote(null)}
        onRename={async (noteId, newTitle) => {
          await handleSaveNote(noteId, { title: newTitle });
        }}
      />

      {/* 14. Empty Trash Confirmation Modal */}
      <EmptyTrashModal
        isOpen={emptyTrashOpen}
        onClose={() => setEmptyTrashOpen(false)}
        onConfirmEmpty={handleEmptyTrash}
        trashedCount={trashCount}
      />
    </div>
  );
}
