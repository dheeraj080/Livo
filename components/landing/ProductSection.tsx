'use client';

import React, { useState } from 'react';
import {
  FileText,
  Paperclip,
  FolderTree,
  Search,
  Check,
  Layers,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function ProductSection() {
  const [activeLayer, setActiveLayer] = useState<'editor' | 'attachments' | 'taxonomy' | 'sync'>('editor');

  const layerPills = [
    { id: 'editor' as const, label: 'Markdown & Math', icon: FileText },
    { id: 'attachments' as const, label: 'PDFs & OCR Attachments', icon: Paperclip },
    { id: 'taxonomy' as const, label: 'Notebooks & Tags', icon: FolderTree },
    { id: 'sync' as const, label: 'Search & Indexing', icon: Search },
  ];

  return (
    <section id="product" className="py-24 md:py-32 lg:py-36 border-t border-zinc-800/40 bg-[#09090b] relative overflow-hidden scroll-mt-20">
      <span id="knowledge-layer" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>One Connected Knowledge Layer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Unify Markdown notes, technical specs, and PDFs.<br />
            <span className="text-zinc-500">Connected through a structured document graph.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Organize long-form Markdown, OCR-scanned PDFs, code snippets, and hierarchical notebooks in a single cohesive workspace backed by PostgreSQL and Elasticsearch indexing.
          </p>
        </ScrollReveal>

        {/* View Switcher Pills */}
        <ScrollReveal delay={80}>
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {layerPills.map((pill) => {
              const Icon = pill.icon;
              const isActive = activeLayer === pill.id;
              return (
                <button
                  key={pill.id}
                  id={`layer-pill-${pill.id}`}
                  onClick={() => setActiveLayer(pill.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-[13px] font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer min-h-[40px] motion-reduce:transform-none ${
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
        </ScrollReveal>

        {/* One Large Unified Visual Workspace */}
        <ScrollReveal delay={120} className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 lg:p-10 xl:p-12 shadow-2xl">
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
                    Saved to Vault
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
                  Drag and drop technical papers, system diagrams, and research notes. Livo automatically runs optical character recognition on images and builds full-text search tokens across every page.
                </p>

                <div className="space-y-3 pt-2 font-mono text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Background OCR pipeline for document attachments</span>
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

          {/* TAB 4: Search & Indexing */}
          {activeLayer === 'sync' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs sm:text-[13px] font-mono text-sky-400 font-semibold uppercase tracking-wider">
                  Elasticsearch Full-Text Engine
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Instant full-text and semantic retrieval across your vault.
                </h3>
                <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                  Decoupled Elasticsearch indexing provides sub-second keyword and phrase searches across thousands of Markdown documents, PDFs, and code snippets without locking the primary PostgreSQL database.
                </p>

                <div className="space-y-3 pt-2 font-mono text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>BM25 tokenization and full-text scoring</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Filter by notebook, tag, or attachment type</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Continuous background synchronization via BullMQ</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 shadow-inner space-y-3">
                {/* Search query appears first */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs sm:text-[13px] font-mono transition-opacity duration-300">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-white font-medium">query: &ldquo;connection pooling latency&rdquo;</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">2 matches found</span>
                </div>

                <div className="space-y-2.5">
                  {/* Result row 1 */}
                  <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 transition-all duration-300 ease-out hover:border-zinc-700/80">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-zinc-200">notes/architecture/pgbouncer-setup.md</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">Score: 0.94</span>
                    </div>
                    <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
                      &ldquo;...Introducing <mark className="bg-sky-500/20 text-sky-300 px-1 rounded">PgBouncer</mark> in transaction mode reduced CPU from 94% to 28% and stabilized <mark className="bg-sky-500/20 text-sky-300 px-1 rounded">p99 latency</mark> at 12ms...&rdquo;
                    </p>
                  </div>

                  {/* Result row 2 */}
                  <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1.5 transition-all duration-300 ease-out hover:border-zinc-700/80">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-zinc-200">specs/database-topology.md</span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-800 border border-zinc-700/50 px-1.5 py-0.5 rounded">Score: 0.81</span>
                    </div>
                    <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
                      &ldquo;...Connection pooling parameters configured across worker nodes to minimize overhead during bulk document indexing...&rdquo;
                    </p>
                  </div>
                </div>

                {/* Metadata footer follows */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-800/60 transition-opacity duration-300">
                  <span>Indexed in Elasticsearch (1,428 documents)</span>
                  <span className="text-zinc-400">BM25 + Hybrid Ranking</span>
                </div>
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
