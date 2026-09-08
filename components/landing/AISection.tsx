'use client';

import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  FileCode,
  Layers,
  Check,
  ChevronRight,
  ShieldCheck,
  Command,
} from 'lucide-react';

export function AISection() {
  const [selectedSource, setSelectedSource] = useState<number>(0);

  const sources = [
    {
      id: 0,
      category: 'Architecture Notes',
      title: 'notes/architecture/ingestion-pipeline.md',
      section: 'Section 2.3: Worker Decoupling & Queue Strategy',
      badge: 'Architecture Note',
      icon: FileText,
      excerpt:
        '“We agreed to decouple document upload from parsing. File uploads write raw binaries immediately to MinIO and push a job descriptor to the Redis ingestion queue. Background workers process OCR and embeddings asynchronously without blocking HTTP response cycles.”',
      timestamp: 'Updated 3 weeks ago',
    },
    {
      id: 1,
      category: 'ADR / Design Document',
      title: 'docs/adr/004-async-ocr-embeddings.md',
      section: 'Decision Outcome & Status: Approved',
      badge: 'Design Record',
      icon: FileCode,
      excerpt:
        '“Status: Approved. Decided against synchronous in-process PDF chunking. Implemented an isolated Python/Tesseract OCR worker pool with Celery/Redis backpressure to guarantee the core web server remains responsive during bulk PDF ingestion.”',
      timestamp: 'Approved in Sprint 14',
    },
    {
      id: 2,
      category: 'Project Documentation',
      title: 'specs/ingestion-service-spec.md',
      section: 'Section 4.1: Storage & Hybrid Index Contracts',
      badge: 'Project Spec',
      icon: Layers,
      excerpt:
        '“Extracted text is split into 512-token chunks with 64-token overlap. Chunks are dual-indexed: dense vectors stored in PostgreSQL (pgvector HNSW) and lexical token inverted indices stored in Elasticsearch for BM25 hybrid fusion.”',
      timestamp: 'Active Specification',
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 lg:py-36 bg-[#09090b] border-t border-zinc-800/80 relative">
      <span id="ai" className="scroll-mt-24" />
      <span id="search" className="scroll-mt-24" />
      <span id="ai-search" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Knowledge Search & Grounding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Ask your knowledge base.<br />
            <span className="text-zinc-500">Grounded with verifiable citations.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Search and reason across notes, technical specs, and parsed PDFs instead of digging through tabs. Every AI response directly links to exact paragraph sources in your vault.
          </p>
        </div>

        {/* Large Dominant Product Demonstration Console */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] shadow-2xl overflow-hidden">
          {/* Top Window Navigation Bar */}
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-700/80" />
                <span className="w-3 h-3 rounded-full bg-zinc-700/80" />
                <span className="w-3 h-3 rounded-full bg-zinc-700/80" />
              </div>
              <span className="text-xs sm:text-[13px] font-mono text-zinc-400 border-l border-zinc-800 pl-3">
                livo / knowledge-query
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-mono text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grounded on 3 local sources</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 xl:p-12 space-y-8 lg:space-y-10">
            {/* 1. USER QUESTION */}
            <div className="space-y-2.5">
              <div className="text-[11px] sm:text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                User Query
              </div>
              <div className="flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl bg-[#18181b] border border-zinc-700/80 text-white font-medium text-sm sm:text-base shadow-inner">
                <Search className="w-5 h-5 text-sky-400 shrink-0" />
                <span className="flex-1 font-sans">
                  What did we decide about the ingestion architecture?
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                  <Command className="w-3 h-3" />
                  <span>↵</span>
                </span>
              </div>
            </div>

            {/* 2. AI GENERATED ANSWER */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono text-zinc-400">
                <span className="text-sky-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Synthesized Answer
                </span>
                <span className="text-zinc-500">Retrieval latency: 34ms</span>
              </div>

              <div className="rounded-xl bg-[#18181b] border border-zinc-800 p-6 sm:p-7 space-y-4 text-sm sm:text-[15px] text-zinc-200 leading-relaxed border-l-2 border-l-sky-400 shadow-sm">
                <p>
                  You decided on an <strong className="text-white font-semibold">asynchronous, queue-based ingestion pipeline</strong> to decouple document uploads from heavy processing:
                </p>

                <div className="space-y-3 text-zinc-300">
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 font-mono text-xs sm:text-[13px] mt-0.5 font-bold">1.</span>
                    <p>
                      <strong className="text-white font-semibold">Decoupled Binary Storage:</strong> Uploaded documents and PDFs are immediately written to local MinIO storage while an event descriptor is pushed to a Redis stream, preventing HTTP request timeouts{' '}
                      <button
                        onClick={() => setSelectedSource(0)}
                        className={`inline-flex items-center font-mono text-[11px] sm:text-xs px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                          selectedSource === 0
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 font-semibold'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        [1] Architecture Notes
                      </button>
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 font-mono text-xs sm:text-[13px] mt-0.5 font-bold">2.</span>
                    <p>
                      <strong className="text-white font-semibold">Asynchronous Worker Pool:</strong> Background OCR and text extraction run in dedicated worker containers with backpressure limits to keep the core web server responsive{' '}
                      <button
                        onClick={() => setSelectedSource(1)}
                        className={`inline-flex items-center font-mono text-[11px] sm:text-xs px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                          selectedSource === 1
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 font-semibold'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        [2] ADR-004
                      </button>
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 font-mono text-xs sm:text-[13px] mt-0.5 font-bold">3.</span>
                    <p>
                      <strong className="text-white font-semibold">Dual Hybrid Indexing:</strong> Extracted chunks are stored simultaneously in PostgreSQL (<code className="text-sky-300 text-xs font-mono">pgvector</code> HNSW) for semantic search and Elasticsearch for BM25 keyword matching{' '}
                      <button
                        onClick={() => setSelectedSource(2)}
                        className={`inline-flex items-center font-mono text-[11px] sm:text-xs px-2.5 py-0.5 rounded transition-all cursor-pointer ${
                          selectedSource === 2
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 font-semibold'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        [3] Project Documentation
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SOURCES & EVIDENCE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono text-zinc-400">
                <span className="uppercase tracking-wider font-semibold text-zinc-300">
                  Source References & Evidence
                </span>
                <span className="text-zinc-500">Click any source to inspect verifiable passage</span>
              </div>

              {/* Source Reference Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {sources.map((source) => {
                  const Icon = source.icon;
                  const isSelected = selectedSource === source.id;
                  return (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source.id)}
                      className={`text-left p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#18181b] border-sky-400/60 shadow-md ring-1 ring-sky-400/30'
                          : 'bg-[#18181b]/60 border-zinc-800 hover:border-zinc-700 hover:bg-[#18181b]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-sky-950/60 text-sky-300 border border-sky-800/50'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {source.category}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">[{source.id + 1}]</span>
                        </div>

                        <h4 className="text-xs sm:text-[13px] font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          {source.title.split('/').pop()}
                        </h4>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {source.section}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                        <span>{source.timestamp}</span>
                        <span className={`flex items-center gap-1 ${isSelected ? 'text-sky-400' : 'text-zinc-400'}`}>
                          {isSelected ? 'Active Source' : 'Inspect'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Source Excerpt Inspector */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-[13px]">
                  <div className="flex items-center gap-2 font-mono text-zinc-300 truncate">
                    <span className="text-sky-400 font-semibold shrink-0">
                      [{selectedSource + 1}] {sources[selectedSource].title}
                    </span>
                    <span className="text-zinc-600 hidden sm:inline">•</span>
                    <span className="text-zinc-400 text-xs truncate">
                      {sources[selectedSource].section}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-0.5 rounded shrink-0 self-start sm:self-auto inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verifiable Source Match
                  </span>
                </div>

                <div className="font-mono text-xs sm:text-[13px] text-zinc-300 bg-[#18181b] p-4 rounded-lg border border-zinc-800/80 leading-relaxed">
                  {sources[selectedSource].excerpt}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
