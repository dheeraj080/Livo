'use client';

import React from 'react';
import { SearchX, ArrowRight, Database, CheckCircle2 } from 'lucide-react';

export function ProblemSection() {
  const scatteredSources = [
    { type: 'RFC Proposals', format: 'markdown', loc: 'Local disk / repo', count: '18 files' },
    { type: 'Research Papers', format: 'PDF & OCR', loc: 'Downloads folder', count: '64 papers' },
    { type: 'Architecture Notes', format: 'Rich text', loc: 'Obsidian & Notion', count: '412 notes' },
    { type: 'Incident Logs', format: 'Code & text', loc: 'Slack & Postmortems', count: '89 threads' },
  ];

  return (
    <section id="problem" className="py-24 md:py-32 lg:py-36 bg-[#09090b] border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>The Fragmentation Problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Knowledge is scattered across tools and systems.<br />
            <span className="text-zinc-500">And traditional keyword search fails.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Engineering RFCs in Git repositories, research papers in local folders, specs in Notion, and incident logs in team chats. Locating critical decisions requires jumping between disconnected silos.
          </p>
        </div>

        {/* Visually Obvious Comparison Graphic */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 lg:p-10 xl:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left: The Scattered State */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs sm:text-[13px] font-mono uppercase text-zinc-300 tracking-wider font-semibold">
                  Scattered Silos
                </span>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                  Keyword Blindness
                </span>
              </div>

              <div className="space-y-3">
                {scatteredSources.map((source, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs sm:text-[13px]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-zinc-500" />
                      <div>
                        <p className="font-medium text-zinc-200">{source.type}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{source.loc}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-700/60">
                      {source.format}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-xs sm:text-[13px] text-zinc-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                  <SearchX className="w-4 h-4 text-zinc-400" />
                  <span>The query failure:</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Searching for <em>&ldquo;latency optimization&rdquo;</em> returns 0 results if your note was titled <em>&ldquo;investigating slow queries with connection pooling&rdquo;</em>.
                </p>
              </div>
            </div>

            {/* Center Arrow / Transition */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center text-center py-4 lg:py-0">
              <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-md">
                <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0 text-sky-400" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 mt-2.5 uppercase tracking-wider">
                Unified Ingest
              </span>
            </div>

            {/* Right: The livo Resolution */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs sm:text-[13px] font-mono uppercase text-sky-400 tracking-wider font-semibold">
                  The livo Knowledge Layer
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                  Hybrid Search + RAG
                </span>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 space-y-3.5">
                <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    Single Self-Hosted Index
                  </span>
                  <span className="text-emerald-400 text-xs">1,428 notes synced</span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-[13px] text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Hybrid Vector + BM25:</strong> Finds concepts by meaning, not just exact keywords.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Universal Ingest:</strong> OCR for PDFs, diagrams, code blocks, & Markdown in one vault.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Grounded Citations:</strong> AI answers with verifiable paragraph-level sources.</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-zinc-400 font-mono text-center">
                Runs 100% on your hardware via Docker Compose. Zero telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
