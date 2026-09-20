'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider, useTheme, Button, Input, Card, Badge, Modal } from '@/packages/ui';
import { 
  Search, Plus, FileText, Sparkles, Network, Settings, 
  Sun, Moon, Monitor, ArrowLeft, Share2, RefreshCw, Cpu, CheckCircle2 
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  updatedAt: string;
  tags: string[];
}

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Architecture & Hybrid Vector Search Spec',
    content: '# Hybrid Search in Livo\n\nLivo combines BM25 full-text lexical search with dense vector embeddings computed locally via Ollama or via secure cloud API.\n\n## Key Advantages\n- 100% offline capability\n- Zero data leakage\n- Sub-50ms query latency across 100,000+ notes.',
    folder: 'Engineering',
    updatedAt: '2 hrs ago',
    tags: ['Architecture', 'AI', 'Search']
  },
  {
    id: '2',
    title: 'Q3 Product Roadmap & Self-Hosting Milestones',
    content: '# Q3 Product Goals\n\n1. Docker Compose one-click installer polish.\n2. Advanced knowledge graph clustering.\n3. Encrypted P2P sync across devices.',
    folder: 'Product',
    updatedAt: '1 day ago',
    tags: ['Roadmap', 'Docker']
  },
  {
    id: '3',
    title: 'Meeting Notes: Core AI Knowledge Assistant',
    content: '# AI Grounded Q&A\n\nDiscussion on how citations are mapped directly back to source paragraphs without hallucinations.',
    folder: 'Meetings',
    updatedAt: '3 days ago',
    tags: ['AI', 'Notes']
  }
];

function LivoAppContent({ initialNoteId }: { initialNoteId?: string }) {
  const { theme, setTheme } = useTheme();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string>(initialNoteId || '1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'workspace' | 'search' | 'ai' | 'graph' | 'settings'>('workspace');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponses, setAiResponses] = useState<{ query: string; answer: string; citations: string[] }[]>([
    {
      query: 'What are the main advantages of hybrid search?',
      answer: 'Livo combines BM25 lexical keyword matching with dense vector embeddings to ensure precise recall even with domain-specific jargon or typos.',
      citations: ['Architecture & Hybrid Vector Search Spec']
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateNoteContent = (newContent: string) => {
    setNotes(notes.map(n => n.id === activeNote.id ? { ...n, content: newContent, updatedAt: 'Just now' } : n));
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing your thoughts here...',
      folder: 'General',
      updatedAt: 'Just now',
      tags: ['New']
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleRunAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const query = aiPrompt;
    setAiPrompt('');
    setIsAiLoading(true);

    setTimeout(() => {
      setAiResponses(prev => [
        {
          query,
          answer: `Based on your private vault notes regarding "${query}", Livo has synthesized that your architecture prioritizes local-first vector indexing with zero external telemetry.`,
          citations: [activeNote.title]
        },
        ...prev
      ]);
      setIsAiLoading(false);
    }, 800);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col font-sans overflow-hidden transition-colors duration-300">
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Landing</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-foreground text-background rounded-md flex items-center justify-center font-bold text-xs shadow-sm">
              N
            </div>
            <span className="font-bold tracking-tight">Livo Workspace</span>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Local Vault Active
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'workspace' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'search' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hybrid Search
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ai' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'graph' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Knowledge Graph
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'workspace' && (
          <>
            <aside className="w-80 border-r border-border bg-card/30 flex flex-col">
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes Vault</span>
                  <Button size="sm" onClick={handleCreateNote} className="gap-1 h-7 px-2.5 text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Note</span>
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes & tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1.5">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      activeNote.id === note.id
                        ? 'bg-card border-border shadow-sm'
                        : 'border-transparent hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{note.folder}</span>
                      <span className="text-[10px] text-muted-foreground">{note.updatedAt}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground tracking-tight line-clamp-1 mb-1.5">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md font-mono text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="flex-1 flex flex-col bg-background overflow-hidden">
              <div className="h-12 border-b border-border px-6 flex items-center justify-between bg-card/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{activeNote.title}</span>
                  <Badge variant="outline" className="text-[10px]">Saved locally</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto">
                <div className="lg:col-span-2 flex flex-col space-y-4">
                  <Input
                    value={activeNote.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNotes(notes.map(n => n.id === activeNote.id ? { ...n, title: val } : n));
                    }}
                    className="text-xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
                  />
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateNoteContent(e.target.value)}
                    className="w-full h-[500px] bg-card/40 border border-border rounded-2xl p-4 text-sm font-mono leading-relaxed text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Write markdown here..."
                  />
                </div>

                <div className="space-y-6">
                  <Card className="p-4 bg-card/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Assistant Insights
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Livo AI has indexed this note for hybrid semantic retrieval. Ask questions or generate summaries instantly.
                    </p>
                    <Button size="sm" onClick={() => setActiveTab('ai')} className="w-full text-xs">
                      Open AI Vault Chat
                    </Button>
                  </Card>

                  <Card className="p-4 bg-card/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Metadata</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Folder</span>
                        <span className="font-medium">{activeNote.folder}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Last Edited</span>
                        <span className="font-medium">{activeNote.updatedAt}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Storage Backend</span>
                        <span className="font-medium">SQLite + Vector</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </main>
          </>
        )}

        {activeTab === 'search' && (
          <div className="flex-1 p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Hybrid Search (BM25 + Dense Vectors)</h2>
              <p className="text-sm text-muted-foreground">
                Experience instant lexical and semantic retrieval across your entire knowledge vault with sub-50ms latency.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search across all notes, tags, and embeddings..."
                className="pl-12 h-12 text-base rounded-2xl"
                defaultValue="hybrid search vector architecture"
              />
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matching Results (3)</h3>
              {notes.map(note => (
                <Card key={note.id} className="p-5 hover:border-primary/50 transition-all cursor-pointer" onClick={() => { setActiveNoteId(note.id); setActiveTab('workspace'); }}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs font-mono">{note.folder}</Badge>
                    <span className="text-xs text-muted-foreground">{note.updatedAt}</span>
                  </div>
                  <h4 className="text-base font-semibold mb-1 text-foreground">{note.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex-1 p-8 max-w-3xl mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Livo Grounded AI Q&A
              </h2>
              <p className="text-sm text-muted-foreground">
                Ask questions against your private notes with verified source citations and zero hallucination risk.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
              {aiResponses.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-xs text-sm max-w-lg">
                      {item.query}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <Card className="p-4 max-w-xl bg-card/80 space-y-2">
                      <p className="text-sm text-foreground leading-relaxed">{item.answer}</p>
                      <div className="pt-2 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Citations:</span>
                        {item.citations.map(c => (
                          <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing answer from local vault...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleRunAiQuery} className="flex gap-3">
              <Input
                placeholder="Ask anything about your notes..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="h-12 text-sm rounded-2xl flex-1"
              />
              <Button type="submit" size="lg" className="h-12 px-6 rounded-2xl">
                Ask AI
              </Button>
            </form>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
              <Network className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Interactive Knowledge Graph</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Visualizing semantic clusters and bi-directional links across your vault. Connected via shared design tokens.
            </p>
            <Button onClick={() => setActiveTab('workspace')}>Return to Workspace</Button>
          </div>
        )}
      </div>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Livo Settings & Configuration">
        <div className="space-y-6 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Appearance Theme</h4>
            <p className="text-xs text-muted-foreground">Choose between light, dark, or system preference synced across packages/ui.</p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'light' ? 'border-primary bg-primary/5 text-foreground font-semibold' : 'border-border text-muted-foreground'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark' ? 'border-primary bg-primary/5 text-foreground font-semibold' : 'border-border text-muted-foreground'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs">Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  theme === 'system' ? 'border-primary bg-primary/5 text-foreground font-semibold' : 'border-border text-muted-foreground'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs">System</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground">Self-Hosting & Storage</h4>
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-xs">Local SQLite + Ollama</p>
                  <p className="text-[11px] text-muted-foreground">Running on docker-compose.yml</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">Active</Badge>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsSettingsOpen(false)}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function LivoApp({ initialNoteId }: { initialNoteId?: string } = {}) {
  return (
    <ThemeProvider>
      <LivoAppContent initialNoteId={initialNoteId} />
    </ThemeProvider>
  );
}
