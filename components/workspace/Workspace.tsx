'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { NoteList } from '@/components/notes/NoteList';
import { MainEditorArea } from '@/components/editor/MainEditorArea';
import { SearchModal } from '@/components/search/SearchModal';
import { AIAssistantDrawer } from '@/components/ai/AIAssistantDrawer';
import { SystemHealthModal } from '@/components/health/SystemHealthModal';
import { CreateNotebookModal } from '@/components/notebooks/CreateNotebookModal';
import { AskMyNotesPanel } from '@/components/ai/AskMyNotesPanel';
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
    <blockquote>Click the <strong>livo AI</strong> button in the top-right toolbar to summarize or extract action items from this note using Gemini server-side.</blockquote>
  `,
  plainText: 'Welcome to livo. livo is your personal AI-powered knowledge management engine inspired by Evernote and Notion.',
  isPinned: true,
  isArchived: false,
  isTrashed: false,
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

  // Modals & Drawers state
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [askMyNotesOpen, setAskMyNotesOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [createNotebookOpen, setCreateNotebookOpen] = useState(false);

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
        notebooks={notebooks}
        tags={tags}
        selectedView={selectedView}
        selectedNotebookId={selectedNotebookId}
        selectedTagId={selectedTagId}
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
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAI={() => setAiDrawerOpen(true)}
        onOpenAskMyNotes={() => setAskMyNotesOpen(true)}
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
        onOpenAI={() => setAiDrawerOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* 4. Ask My Notes RAG Assistant Panel */}
      <AskMyNotesPanel
        isOpen={askMyNotesOpen}
        onClose={() => setAskMyNotesOpen(false)}
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

      {/* 5. AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        noteTitle={activeNote?.title || 'Untitled Note'}
        noteContent={activeNote?.content || ''}
        onInsertContent={(contentToInsert) => {
          if (activeNote) {
            handleSaveNote(activeNote.id, {
              content: `${activeNote.content}<p>---</p><blockquote>${contentToInsert}</blockquote>`,
              plainText: `${activeNote.plainText || ''}\n\n${contentToInsert}`,
            });
          }
        }}
      />

      {/* 6. Search Palette Modal (Elasticsearch) */}
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

      {/* 7. System Health Diagnostic Modal */}
      <SystemHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />

      {/* 8. Create Notebook Modal */}
      <CreateNotebookModal
        isOpen={createNotebookOpen}
        onClose={() => setCreateNotebookOpen(false)}
        onCreate={handleCreateNotebook}
      />
    </div>
  );
}
