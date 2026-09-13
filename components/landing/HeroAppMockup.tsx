'use client';

import React from 'react';
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
  CheckCircle2,
  ShieldCheck,
  Paperclip,
} from 'lucide-react';

export function HeroAppMockup() {
  const notes = [
    {
      title: 'Migrating from Microservices to a Modular Monolith',
      preview:
        'p99 latency reduced from 142ms to 28ms after service consolidation.',
      tags: ['architecture', 'performance'],
      active: true,
    },
    {
      title: 'PostgreSQL Hybrid Vector Search',
      preview:
        'Benchmarking HNSW and BM25 search across 500k notes.',
      tags: ['postgres', 'search'],
      active: false,
    },
    {
      title: 'Zero-Knowledge CRDT Sync Protocol',
      preview:
        'Local-first synchronization with encrypted state replication.',
      tags: ['sync', 'security'],
      active: false,
    },
  ];

  return (
    <div
      id="hero-app-mockup"
      className="relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl"
    >
      {/* =========================================================
          STATIC APPLICATION WINDOW BAR
      ========================================================== */}
      <div className="flex h-11 items-center justify-between border-b border-zinc-800 bg-[#111113] px-3 sm:px-4">
        {/* Window controls — purely decorative */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>

          <span className="hidden truncate font-mono text-[11px] font-medium text-zinc-500 sm:block">
            livo
          </span>
        </div>

        {/* Static search display */}
        <div className="mx-3 flex h-7 w-full max-w-sm items-center gap-2 rounded-md border border-zinc-700/70 bg-zinc-900 px-2.5 text-[11px] text-zinc-400">
          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />

          <span className="truncate">
            Search ...
          </span>

          <span className="ml-auto hidden shrink-0 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500 sm:block">
            Ctrl + K
          </span>
        </div>

        {/* Static status */}
        <div className="flex shrink-0 items-center">
          <div className="hidden items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-[9px] text-zinc-400 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Self-hosted
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN WORKSPACE
      ========================================================== */}
      <div className="grid min-h-[470px] grid-cols-12 overflow-hidden lg:min-h-[500px]">

        {/* =======================================================
            LEFT SIDEBAR
            Entirely decorative — no navigation
        ======================================================== */}
        <aside className="col-span-3 hidden border-r border-zinc-800 bg-[#111113] p-3 md:block lg:col-span-2">
          {/* Vault */}
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sky-500/15 text-[10px] font-bold text-sky-400">
              L
            </div>

            <span className="truncate text-[11px] font-medium text-zinc-200">
              Personal Vault
            </span>

            <HardDrive className="ml-auto h-3.5 w-3.5 shrink-0 text-zinc-600" />
          </div>

          {/* Static navigation-like information */}
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 rounded-md bg-zinc-900 px-2.5 py-2 text-[11px] font-medium text-zinc-100">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              <span>All Notes</span>

              <span className="ml-auto font-mono text-[9px] text-zinc-600">
                1,428
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] text-zinc-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>AI Insights</span>

              <span className="ml-auto font-mono text-[9px] text-zinc-700">
                34
              </span>
            </div>
          </div>

          {/* Notebooks */}
          <div className="mb-2 flex items-center justify-between px-2 text-[9px] font-mono uppercase tracking-widest text-zinc-600">
            <span>Notebooks</span>
            <Plus className="h-3 w-3" />
          </div>

          <div className="mb-6 space-y-0.5">
            <div className="flex items-center gap-2 rounded-md bg-zinc-900/70 px-2 py-1.5 text-[10px] text-zinc-200">
              <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
              <span className="truncate">Architecture</span>
            </div>

            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-zinc-500">
              <Folder className="h-3.5 w-3.5" />
              <span className="truncate">Database</span>
            </div>

            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-zinc-500">
              <Folder className="h-3.5 w-3.5" />
              <span className="truncate">Research</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-2 px-2 text-[9px] font-mono uppercase tracking-widest text-zinc-600">
            Tags
          </div>

          <div className="flex flex-wrap gap-1 px-1">
            <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-1 text-[9px] text-zinc-500">
              <Hash className="h-2.5 w-2.5 text-sky-400" />
              architecture
            </span>

            <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-1 text-[9px] text-zinc-500">
              <Hash className="h-2.5 w-2.5 text-emerald-400" />
              postgres
            </span>

            <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-1 text-[9px] text-zinc-500">
              <Hash className="h-2.5 w-2.5 text-indigo-400" />
              security
            </span>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center gap-1.5 border-t border-zinc-900 pt-3 text-[9px] text-zinc-600">

            <Settings className="ml-auto h-3.5 w-3.5" />
          </div>
        </aside>

        {/* =======================================================
            NOTE LIST
            Static visual representation
        ======================================================== */}
        <section className="col-span-4 border-r border-zinc-800 bg-[#131315] sm:col-span-4 lg:col-span-3">
          {/* Header */}
          <div className="border-b border-zinc-800 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-200">
                Architecture
              </span>

              <span className="font-mono text-[9px] text-zinc-600">
                18 notes
              </span>
            </div>

            <div className="flex items-center gap-1 text-[9px] text-zinc-600">
              <Sparkles className="h-2.5 w-2.5 text-sky-400" />
              <span>Semantic search enabled</span>
            </div>
          </div>

          {/* Notes */}
          <div className="divide-y divide-zinc-800/70">
            {notes.map((note) => (
              <div
                key={note.title}
                className={`border-l-2 p-3 ${
                  note.active
                    ? 'border-l-sky-400 bg-zinc-800/50'
                    : 'border-l-transparent'
                }`}
              >
                <div className="mb-1.5 flex items-start gap-2">
                  <FileText
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      note.active
                        ? 'text-zinc-200'
                        : 'text-zinc-600'
                    }`}
                  />

                  <h3
                    className={`line-clamp-2 text-[10px] font-medium leading-snug ${
                      note.active
                        ? 'text-zinc-100'
                        : 'text-zinc-400'
                    }`}
                  >
                    {note.title}
                  </h3>
                </div>

                <p className="mb-2 line-clamp-2 pl-5 text-[9px] leading-relaxed text-zinc-600">
                  {note.preview}
                </p>

                <div className="flex flex-wrap gap-1 pl-5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[8px] text-zinc-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =======================================================
            EDITOR
        ======================================================== */}
        <main className="col-span-8 flex min-w-0 flex-col bg-[#18181b] lg:col-span-4">
          {/* Breadcrumb */}
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-zinc-800 px-3">
            <div className="flex min-w-0 items-center gap-1 text-[9px] font-mono text-zinc-600">
              <span className="truncate">Architecture</span>

              <ChevronRight className="h-2.5 w-2.5 shrink-0" />

              <span className="truncate text-zinc-400">
                Monolith-Migration.md
              </span>
            </div>

            <div className="hidden items-center gap-1.5 text-[8px] text-zinc-600 sm:flex">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Saved
            </div>
          </div>

          {/* Minimal static toolbar */}
          <div className="flex h-8 shrink-0 items-center gap-1 border-b border-zinc-800 bg-zinc-900/30 px-3">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-zinc-500">
              B
            </span>

            <span className="rounded px-1.5 py-0.5 text-[10px] italic text-zinc-500">
              I
            </span>

            <div className="mx-1 h-3 w-px bg-zinc-800" />

            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
              H1
            </span>

            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
              H2
            </span>

            <div className="ml-auto flex items-center gap-1 text-[8px] text-zinc-600">
              <Paperclip className="h-3 w-3" />
              <span className="hidden sm:inline">Attach</span>
            </div>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-hidden px-4 py-5 sm:px-6">
            <article className="mx-auto max-w-2xl">
              {/* Title */}
              <h1 className="mb-3 text-lg font-bold leading-tight tracking-tight text-zinc-100 sm:text-xl">
                Migrating to a Modular Monolith
              </h1>

              <div className="mb-5 flex items-center gap-2 border-b border-zinc-800 pb-3 text-[9px] text-zinc-600">
                <span>Architecture RFC</span>
                <span>•</span>
                <span>Updated today</span>
              </div>

              {/* Key result */}
              <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-sky-400">
                  <Sparkles className="h-3 w-3" />
                  Key result
                </div>

                <div className="mb-2 flex items-end gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-zinc-100">
                    142ms
                  </span>

                  <span className="pb-1 text-sm text-zinc-600">
                    →
                  </span>

                  <span className="text-2xl font-semibold tracking-tight text-emerald-400">
                    28ms
                  </span>
                </div>

                <p className="text-[10px] leading-relaxed text-zinc-500">
                  Checkout p99 latency after consolidating order,
                  inventory, and ledger services.
                </p>
              </div>

              {/* Section 1 */}
              <section className="mb-5">
                <h2 className="mb-2 text-sm font-semibold text-zinc-100">
                  1. Diagnostic Findings
                </h2>

                <p className="text-[10px] leading-relaxed text-zinc-500 sm:text-[11px]">
                  Prior to migration, most transaction latency came from
                  inter-service HTTP requests and JSON serialization.
                  Moving the domain boundaries into a single process
                  eliminated unnecessary network hops while preserving
                  clear module boundaries.
                </p>
              </section>

              {/* Architecture visualization */}
              <div className="mb-5 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="mb-3 text-[8px] font-mono uppercase tracking-widest text-zinc-600">
                  Request path
                </div>

                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[8px] text-zinc-400">
                    API
                  </div>

                  <div className="h-px w-4 bg-zinc-800" />

                  <div className="rounded border border-sky-500/20 bg-sky-500/5 px-2 py-1.5 text-[8px] text-sky-300">
                    Order
                  </div>

                  <div className="h-px w-4 bg-zinc-800" />

                  <div className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5 text-[8px] text-emerald-300">
                    Inventory
                  </div>

                  <div className="h-px w-4 bg-zinc-800" />

                  <div className="rounded border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[8px] text-amber-300">
                    Ledger
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <section>
                <h2 className="mb-2 text-sm font-semibold text-zinc-100">
                  2. Operational Outcomes
                </h2>

                <p className="text-[10px] leading-relaxed text-zinc-500 sm:text-[11px]">
                  Deployment complexity decreased from fourteen
                  independent services to a unified application stack.
                  The result was faster deployments, fewer failure
                  boundaries, and a significantly smaller operational
                  footprint.
                </p>
              </section>
            </article>
          </div>
        </main>

        {/* =======================================================
            AI PANEL
            Static visual representation
        ======================================================== */}
        <aside className="col-span-12 border-t border-zinc-800 bg-[#111113] lg:col-span-3 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-3">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
                  <Bot className="h-3 w-3 text-zinc-300" />
                </div>

                <span className="text-[10px] font-semibold text-zinc-200">
                  livo AI
                </span>
              </div>

          
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-hidden p-3">
              {/* Question */}
              <div className="mb-4">
                <div className="mb-1.5 text-[8px] font-mono uppercase tracking-wider text-zinc-700">
                  You asked
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-[10px] leading-relaxed text-zinc-400">
                  What improved after consolidating the services?
                </div>
              </div>

              {/* Answer */}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-wider text-zinc-700">
                  <Sparkles className="h-2.5 w-2.5 text-sky-400" />
                  Knowledge AI
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                  <p className="mb-3 text-[10px] leading-relaxed text-zinc-300">
                    The migration produced a significant latency
                    reduction by removing inter-service network
                    overhead.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded bg-zinc-950 px-2 py-1.5">
                      <span className="text-[9px] text-zinc-500">
                        Checkout p99
                      </span>

                      <span className="font-mono text-[9px] text-emerald-400">
                        142ms → 28ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded bg-zinc-950 px-2 py-1.5">
                      <span className="text-[9px] text-zinc-500">
                        Network hops
                      </span>

                      <span className="font-mono text-[9px] text-emerald-400">
                        9 → 1
                      </span>
                    </div>
                  </div>

                  {/* Static citation */}
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2">
                    <div className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-[8px] text-zinc-500">
                      <FileText className="h-2.5 w-2.5" />
                      RFC-044 §1
                    </div>

                    <span className="text-[8px] text-zinc-700">
                      Source
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Static AI input */}
            <div className="border-t border-zinc-800 p-3">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2">
                <span className="min-w-0 flex-1 truncate text-[9px] text-zinc-600">
                  Ask about your notes...
                </span>

                <div className="rounded bg-zinc-800 p-1.5 text-zinc-600">
                  <span className="text-[9px]">↵</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* =========================================================
          SUBTLE BOTTOM ACCENT
      ========================================================== */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
    </div>
  );
}
