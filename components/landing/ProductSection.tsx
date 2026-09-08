'use client';

import React, { useState } from 'react';
import {
  FileText,
  Paperclip,
  FolderTree,
  Zap,
  Check,
  Layers,
} from 'lucide-react';

export function ProductSection() {
  const [activeLayer, setActiveLayer] = useState<'editor' | 'attachments' | 'taxonomy' | 'sync'>('editor');

  const layerPills = [
    { id: 'editor' as const, label: 'Markdown & Math', icon: FileText },
    { id: 'attachments' as const, label: 'PDFs & OCR Attachments', icon: Paperclip },
    { id: 'taxonomy' as const, label: 'Notebooks & Tags', icon: FolderTree },
    { id: 'sync' as const, label: 'Local-First Engine', icon: Zap },
  ];

  return (
    <section id="product" className="py-24 md:py-32 lg:py-36 border-t border-zinc-800/80 bg-[#09090b] relative overflow-hidden">
      <span id="knowledge-layer" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>One Connected Knowledge Layer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Unify Markdown notes, technical specs, and PDFs.<br />
            <span className="text-zinc-500">Connected through a structured document graph.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Organize long-form Markdown, OCR-scanned PDFs, code snippets, and hierarchical notebooks in a single cohesive workspace backed by local SQLite and instant full-text indexing.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {layerPills.map((pill) => {
            const Icon = pill.icon;
            const isActive = activeLayer === pill.id;
            return (
              <button
                key={pill.id}
                id={`layer-pill-${pill.id}`}
                onClick={() => setActiveLayer(pill.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-[13px] font-medium transition-all cursor-pointer min-h-[40px] ${
                  isActive
                    ? 'bg-white text-black border-white font-semibold shadow-sm'
                    : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* One Large Unified Visual Workspace */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 lg:p-10 xl:p-12 shadow-2xl">
          {/* TAB 1: Markdown & Math */}
          {activeLayer === 'editor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs sm:text-[13px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                  Extensible Editor Kernel
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Seamless Markdown, syntax-highlighted code, and LaTeX math.
                </h3>
                <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                  Powered by a headless Tiptap engine. Write freely with Markdown shortcuts, insert collapsible callout admonitions, or embed mathematical formulations with instant live rendering.
                </p>

                <div className="space-y-3 pt-2 font-mono text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Native LaTeX preview: {`$\\mathcal{O}(N \\log N)$`}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Syntax highlighting for 80+ programming languages</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Bi-directional backlinks: [[Distributed Consensus]]</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 shadow-inner">
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4 text-xs sm:text-[13px] font-mono text-zinc-400">
                  <span className="text-zinc-200">notes/raft-consensus-implementation.md</span>
                  <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px]">
                    Saved Local (0ms latency)
                  </span>
                </div>
                <div className="space-y-3.5 text-xs sm:text-[13px]">
                  <h4 className="text-base sm:text-lg font-semibold text-white">
                    Leader Election & Log Compaction in Raft
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    When the heartbeat timer expires (T<sub>heartbeat</sub> &isin; [150, 300]ms), a follower node transitions to candidate state and increments its current term:
                  </p>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                    <span className="text-purple-400">type</span> TermState = &#123; term: <span className="text-sky-400">number</span>, votedFor: <span className="text-sky-400">NodeId | null</span> &#125;;{'\n'}
                    <span className="text-purple-400">function</span> <span className="text-white">requestVote</span>(candidate: NodeId, term: <span className="text-sky-400">number</span>) &#123;{'\n'}
                    {'  '}<span className="text-zinc-500">{'// In-memory RPC dispatch across cluster nodes'}</span>{'\n'}
                    &#125;
                  </div>
                  <div className="p-3.5 bg-zinc-900/90 border-l-2 border-sky-400 rounded-r text-zinc-300 text-xs sm:text-[13px] leading-relaxed">
                    <strong className="text-white">Important Note:</strong> Log compaction is executed atomically to prevent split-brain states during network partitions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Attachments & OCR */}
          {activeLayer === 'attachments' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs sm:text-[13px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                  Deep Media Parsing
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Attach PDFs, whitepapers, & diagrams. All fully OCR-indexed.
                </h3>
                <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                  Drag and drop technical papers, system diagrams, and research notes. livo automatically runs optical character recognition on images and builds full-text search tokens across every page.
                </p>

                <div className="space-y-3 pt-2 font-mono text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Background OCR with 0 external cloud dependencies</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Extracted text queryable via hybrid search</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Zero file size lock-in on local MinIO storage</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400 font-mono text-xs font-bold">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs sm:text-[13px] font-semibold text-white">dynamo-distributed-storage.pdf</p>
                      <p className="text-[11px] text-zinc-500 font-mono">16 pages &bull; 4.2 MB &bull; Ingested 2 hrs ago</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                    OCR Complete
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs sm:text-[13px] font-mono text-zinc-400 space-y-2 leading-relaxed">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">
                    Extracted Text Preview (Page 4)
                  </span>
                  <p className="text-zinc-300">
                    &ldquo;...Sloppy quorums and hinted handoff ensure that write operations succeed even when network partitions isolate node members from their designated preference lists...&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Taxonomy & Graph */}
          {activeLayer === 'taxonomy' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs sm:text-[13px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                  Organized Knowledge
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Notebook hierarchies, multi-dimensional tags, and backlinks.
                </h3>
                <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                  Avoid the chaos of flat folder structures. Group projects into hierarchical notebooks, track topics with cross-cutting tags, and navigate related concepts via bidirectional wiki-links.
                </p>

                <div className="space-y-3 pt-2 font-mono text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Recursive nested notebooks with custom icons</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Instant tag filtering across thousands of records</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Interactive knowledge graph visualization</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 shadow-inner space-y-3">
                <div className="text-xs sm:text-[13px] font-mono text-zinc-400 pb-2 border-b border-zinc-800">
                  Vault Tree Hierarchy
                </div>
                <div className="space-y-2 font-mono text-xs sm:text-[13px]">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-600">📁</span>
                    <span className="text-white font-medium">Architecture RFCs/</span>
                    <span className="text-[11px] text-zinc-500">(14 notes)</span>
                  </div>
                  <div className="pl-6 space-y-2 border-l border-zinc-800 ml-3">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-zinc-600">📄</span>
                      <span>001-microservices-to-monolith.md</span>
                      <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">#architecture</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-zinc-600">📄</span>
                      <span>004-async-ocr-embeddings.md</span>
                      <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">#ingestion</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 pt-2">
                    <span className="text-zinc-600">📁</span>
                    <span className="text-white font-medium">Research & Benchmarks/</span>
                    <span className="text-[11px] text-zinc-500">(28 notes)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Local-First Engine */}
          {activeLayer === 'sync' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs sm:text-[13px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                  Instantaneous Response
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Local-first performance with instantaneous search.
                </h3>
                <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                  Zero lag when switching notes or typing complex documents. Everything executes locally in memory with persistent SQLite backups and deterministic background sync.
                </p>

                <div className="space-y-3 pt-2 font-mono text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Sub-millisecond note opening and cursor render</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Offline-first operation with optimistic updates</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Export to standard Markdown files at any time</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 shadow-inner space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="text-xl sm:text-2xl font-bold text-white font-mono">&lt; 1ms</div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-1">Editor Key Latency</div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">100%</div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-1">Offline Capable</div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="text-xl sm:text-2xl font-bold text-sky-400 font-mono">0ms</div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-1">Cloud Dependency</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400 text-center">
                  All state changes persist to local SQLite with WAL journaling enabled.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
