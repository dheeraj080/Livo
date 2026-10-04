'use client';

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Search,
  Sparkles,
  Bot,
  Hash,
  ChevronRight,
  HardDrive,
  Settings,
  Plus,
  Share2,
  CheckCircle2,
  Clock,
  Code2,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
  CornerDownLeft,
  Cpu,
  ShieldCheck,
  Tag,
  Paperclip,
  Check,
} from 'lucide-react';

export function HeroAppMockup() {
  const [activeNoteId, setActiveNoteId] = useState<'monolith' | 'postgres' | 'sync'>('monolith');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [aiProvider, setAiProvider] = useState<'local' | 'gemini'>('local');
  const [filterMode, setFilterMode] = useState<'all' | 'semantic' | 'exact'>('semantic');
  const [copiedCitation, setCopiedCitation] = useState(false);

  const notes = [
    {
      id: 'monolith' as const,
      title: 'Migrating from Microservices to a Modular Monolith',
      preview: 'Analysis of p99 latency reduction, network hop elimination, and memory footprint across 14 services...',
      time: '14:22 Today',
      tags: ['architecture', 'performance'],
      notebook: 'Architecture RFCs',
      citationsCount: 3,
    },
    {
      id: 'postgres' as const,
      title: 'PostgreSQL Indexing & Hybrid Vector Search with pgvector',
      preview: 'Benchmarking HNSW vs IVFFlat indexes alongside BM25 full-text scoring for 500k notes...',
      time: 'Yesterday',
      tags: ['postgres', 'database'],
      notebook: 'Database Internals',
      citationsCount: 2,
    },
    {
      id: 'sync' as const,
      title: 'Document Storage & S3 Buckets with MinIO',
      preview: 'Managing binary attachments, PDF archives, and assets with S3-compatible storage and PostgreSQL metadata...',
      time: 'Aug 29',
      tags: ['storage', 'minio'],
      notebook: 'Core Infrastructure',
      citationsCount: 1,
    },
  ];

  return (
    <div
      id="hero-app-mockup"
      className="w-full rounded-xl border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col bg-zinc-900 text-zinc-100"
    >
      {/* Top Application Window Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121214] border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-3 text-xs font-mono text-zinc-400 font-medium hidden sm:inline-block">
            livo-desktop — personal-vault (v0.9.4)
          </span>
        </div>

        {/* Global Search pill */}
        <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/60 px-3 py-1 rounded-md text-xs text-zinc-300 w-64 max-w-full">
          <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate text-zinc-200">Search 1,428 notes (⌘K)</span>
          <span className="ml-auto text-[10px] font-mono px-1 py-0.2 bg-zinc-700/80 rounded text-zinc-300">
            Hybrid
          </span>
        </div>

        {/* Host Status & Panel Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>Self-Hosted: Online</span>
          </div>

          <button
            id="toggle-ai-sidebar-btn"
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isAiPanelOpen ? 'Collapse AI panel' : 'Open AI panel'}
          >
            {isAiPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column / 4-Column Workspace Grid */}
      <div className="grid grid-cols-12 min-h-[520px] max-h-[640px] overflow-hidden text-xs">
        {/* COLUMN 1: LEFT SIDEBAR (Notebooks, Tags, Vault) */}
        <div className="hidden md:flex md:col-span-3 lg:col-span-2 flex-col bg-[#121214] border-r border-zinc-800 p-3 select-none">
          {/* Vault Selector */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-900/70 border border-zinc-800/70 mb-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-4 h-4 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                N
              </div>
              <span className="font-medium truncate text-zinc-200 text-xs">Personal Vault</span>
            </div>
            <HardDrive className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </div>

          {/* Quick Nav */}
          <div className="space-y-0.5 mb-4">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-zinc-900 text-zinc-100 font-medium">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>All Notes</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">1,428</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Insights</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">34</span>
            </div>
          </div>

          {/* Notebooks List */}
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-2 mb-1.5">
            <span>Notebooks</span>
            <Plus className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
          </div>
          <div className="space-y-0.5 mb-4 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-zinc-900/50 text-zinc-200">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Architecture RFCs</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">18</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">Database Internals</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">31</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">Core Infrastructure</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">42</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                <span className="truncate">Research Papers</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">67</span>
            </div>
          </div>

          {/* Tags */}
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 px-2 mb-1.5">
            Tags
          </div>
          <div className="flex flex-wrap gap-1 px-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px]">
              <Hash className="w-2.5 h-2.5 text-sky-400" />
              architecture
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px]">
              <Hash className="w-2.5 h-2.5 text-emerald-400" />
              postgres
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px]">
              <Hash className="w-2.5 h-2.5 text-indigo-400" />
              latency
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[10px]">
              <Hash className="w-2.5 h-2.5 text-amber-400" />
              vector
            </span>
          </div>

          {/* Bottom Settings footer */}
          <div className="mt-auto pt-3 border-t border-zinc-900 flex items-center justify-between text-zinc-500">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Self-Hosted Vault</span>
            </div>
            <Settings className="w-3.5 h-3.5 hover:text-zinc-300 cursor-pointer" />
          </div>
        </div>

        {/* COLUMN 2: NOTE LIST */}
        <div className="col-span-12 sm:col-span-5 md:col-span-4 lg:col-span-3 bg-[#121214]/90 border-r border-zinc-800 flex flex-col">
          {/* Note list header & mode switch */}
          <div className="p-3 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-zinc-200">Architecture RFCs</span>
              <span className="text-[11px] font-mono text-zinc-500">18 notes</span>
            </div>
            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  filterMode === 'all'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('semantic')}
                className={`flex-1 py-1 rounded text-center transition-colors flex items-center justify-center gap-1 ${
                  filterMode === 'semantic'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5 text-zinc-300" />
                Semantic
              </button>
              <button
                onClick={() => setFilterMode('exact')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  filterMode === 'exact'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Exact BM25
              </button>
            </div>
          </div>

          {/* Notes items */}
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/50">
            {notes.map((note) => {
              const isActive = activeNoteId === note.id;
              return (
                <div
                  key={note.id}
                  id={`note-item-${note.id}`}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-3 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-zinc-800/60 border-l-2 border-l-white text-zinc-100'
                      : 'hover:bg-zinc-800/30 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-zinc-500">{note.time}</span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-1 py-0.2 rounded border border-zinc-700">
                      {note.citationsCount} citations
                    </span>
                  </div>
                  <h4 className="font-medium text-xs text-zinc-200 mb-1 leading-snug line-clamp-1">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-2">
                    {note.preview}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded text-[10px] text-zinc-300 uppercase font-mono px-1.5 py-0.2 bg-zinc-800 border border-zinc-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: RICH-TEXT EDITOR */}
        <div
          className={`flex flex-col bg-[#18181b] overflow-hidden ${
            isAiPanelOpen
              ? 'col-span-12 sm:col-span-7 md:col-span-5 lg:col-span-4 xl:col-span-5'
              : 'col-span-12 sm:col-span-7 md:col-span-8 lg:col-span-7 xl:col-span-7'
          } border-r border-zinc-800`}
        >
          {/* Note Editor Header Bar */}
          <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between bg-[#18181b] text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
              <span>Architecture RFCs</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-200">Monolith-Migration.md</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono">1,842 words</span>
              <span className="text-[10px] text-zinc-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Synced
              </span>
            </div>
          </div>

          {/* Editor Formatting Ribbon */}
          <div className="px-4 py-1.5 border-b border-zinc-800 flex items-center gap-1 text-zinc-400 bg-zinc-900/40 overflow-x-auto text-xs shrink-0">
            <button className="px-1.5 py-0.5 rounded font-bold hover:bg-zinc-800 text-zinc-200">B</button>
            <button className="px-1.5 py-0.5 rounded italic hover:bg-zinc-800 text-zinc-200">I</button>
            <button className="px-1.5 py-0.5 rounded underline hover:bg-zinc-800 text-zinc-200">U</button>
            <div className="w-[1px] h-3 bg-zinc-800 mx-1" />
            <span className="px-1.5 py-0.5 rounded hover:bg-zinc-800 text-[11px] font-mono">H1</span>
            <span className="px-1.5 py-0.5 rounded hover:bg-zinc-800 text-[11px] font-mono">H2</span>
            <div className="w-[1px] h-3 bg-zinc-800 mx-1" />
            <button className="p-1 rounded hover:bg-zinc-800" title="Code Block">
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-zinc-800" title="Attachments">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <div className="ml-auto flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono">
                <Sparkles className="w-2.5 h-2.5 text-zinc-300" />
                AI Assist (Space)
              </span>
            </div>
          </div>

          {/* Editor Content Area */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Migrating from Microservices to a Modular Monolith: Latency & Operational Outcomes
            </h1>

            {/* Note Meta Tags */}
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/70 text-zinc-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                Updated Today, 14:22
              </span>
              <span>•</span>
              <span className="text-zinc-400">Author: Team Architecture</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">RFC-044-Approved</span>
            </div>

            {/* Callout box */}
            <div className="p-3.5 rounded-lg bg-sky-950/20 border-l-2 border-l-sky-400 border-y border-r border-zinc-800/60 text-zinc-300 space-y-1 text-xs">
              <div className="font-semibold text-sky-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Executive Summary & Latency Benchmark</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-300">
                Consolidation of the order execution, inventory verification, and ledger services
                reduced our checkout p99 latency from <strong className="text-zinc-100 font-semibold">142ms down to 28ms</strong>. Network serialization hops dropped from 9 to 1.
              </p>
            </div>

            {/* Section content */}
            <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
              <h3 className="text-sm font-semibold text-zinc-100 pt-1">1. Diagnostic Findings</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Prior to this migration, 68% of latency in user transactions was spent on inter-service HTTP
                and JSON marshaling. By moving domain boundaries into modular TypeScript modules within a
                single process, inter-service calls became zero-copy memory references.
              </p>
            </div>

            {/* Code Block */}
            <div className="rounded-lg bg-zinc-900 border border-zinc-800/90 overflow-hidden font-mono text-[11px]">
              <div className="px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400">
                <span>events/order-bus.ts</span>
                <span className="text-[10px] text-zinc-500">In-Process Dispatch</span>
              </div>
              <pre className="p-3 text-zinc-300 overflow-x-auto leading-normal">
                <code>
                  <span className="text-purple-400">export async function</span>{' '}
                  <span className="text-sky-400">dispatchOrderCompleted</span>(event:{' '}
                  <span className="text-amber-300">OrderEvent</span>) &#123;{'\n'}
                  {'  '}<span className="text-zinc-500">{'// Direct in-memory event dispatch, zero network overhead'}</span>{'\n'}
                  {'  '}<span className="text-purple-400">await</span> ledgerService.recordTransaction(event);{'\n'}
                  {'  '}<span className="text-purple-400">await</span> inventoryService.decrementStock(event);{'\n'}
                  &#125;
                </code>
              </pre>
            </div>

            {/* Section 2 with citation marker */}
            <div className="space-y-2 text-xs leading-relaxed text-zinc-300">
              <h3 className="text-sm font-semibold text-zinc-100 pt-1">
                2. Operational Simplicity & Docker Footprint
              </h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Services consolidated into a single Docker Compose stack with PostgreSQL, Redis, Elasticsearch, and MinIO.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 4: AI ASSISTANT PANEL */}
        {isAiPanelOpen && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2 bg-[#121214] flex flex-col p-3 border-t lg:border-t-0 border-zinc-800">
            {/* AI Panel Header */}
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-zinc-300" />
                <span className="font-semibold text-xs text-zinc-200">Knowledge AI</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="ai-provider-local-btn"
                  onClick={() => setAiProvider('local')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    aiProvider === 'local'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Run offline with Ollama"
                >
                  Ollama
                </button>
                <button
                  id="ai-provider-gemini-btn"
                  onClick={() => setAiProvider('gemini')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    aiProvider === 'gemini'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Cloud AI via Gemini API key"
                >
                  Gemini
                </button>
              </div>
            </div>

            {/* AI Chat Conversation Thread */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {/* User message */}
              <div className="bg-zinc-900 rounded-lg p-2.5 border border-zinc-800 text-xs text-zinc-200">
                <p className="text-[10px] font-mono text-zinc-500 mb-1">You asked:</p>
                <p className="text-zinc-200 leading-snug">
                  What were the measured latency improvements after consolidating services?
                </p>
              </div>

              {/* AI Grounded Response */}
              <div className="bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-zinc-300" />
                    {aiProvider === 'local' ? 'Ollama Llama-3.3' : 'Gemini 2.5 Flash'}
                  </span>
                  <span className="text-zinc-500">100% Grounded</span>
                </div>

                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  According to your note <strong className="text-zinc-100">Monolith-Migration.md</strong>:
                </p>

                <ul className="text-[11px] space-y-1 text-zinc-300 list-disc list-inside">
                  <li>
                    Checkout p99 dropped from <strong className="text-emerald-400 font-semibold">142ms → 28ms</strong>.
                  </li>
                  <li>
                    Network serialization hops reduced from <strong className="text-emerald-400 font-semibold">9 → 1</strong>.
                  </li>
                </ul>

                {/* Grounded Citation chip */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCopiedCitation(true);
                      setTimeout(() => setCopiedCitation(false), 1500);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 px-2 py-0.5 rounded transition-colors"
                  >
                    {copiedCitation ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-emerald-400">Cited Section 1</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-2.5 h-2.5 text-zinc-400" />
                        <span>RFC-044 §1</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-zinc-500 font-mono">0.31s latency</span>
                </div>
              </div>
            </div>

            {/* AI Prompt Input Bar */}
            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs">
                <input
                  type="text"
                  placeholder="Ask a question about this note..."
                  readOnly
                  value="Summarize the deployment changes"
                  className="bg-transparent text-zinc-300 placeholder-zinc-500 w-full focus:outline-none text-[11px]"
                />
                <button
                  aria-label="Send query"
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                >
                  <CornerDownLeft className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
