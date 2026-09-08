'use client';

import React, { useState } from 'react';
import {
  FileText,
  PenTool,
  Hash,
  Heading,
  HelpCircle,
  MessageSquareCode,
  Sparkles,
  ArrowRight,
  Check,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function AIToolsSection() {
  const [selectedTool, setSelectedTool] = useState<number>(0);
  const [selectedProvider, setSelectedProvider] = useState<'ollama' | 'gemini'>('ollama');

  const tools = [
    {
      id: 0,
      name: 'Summarize',
      icon: FileText,
      tagline: 'Instant executive takeaways',
      desc: 'Condense 20-page meeting logs, RFC proposals, or research PDFs into high-signal key takeaways and action items.',
      inputLabel: 'Raw Note (2,400 words)',
      inputText:
        'We ran load tests against 6 database instances using pgbench. At 1,000 connections, CPU spiked to 94% due to process-per-connection contention. Introducing PgBouncer in transaction mode dropped CPU to 28% and stabilized p99 latency at 12ms...',
      outputLabel: 'Synthesized Summary',
      outputText:
        '• Root Cause: Process-per-connection overhead in PostgreSQL caused 94% CPU at 1,000 connections.\n• Resolution: PgBouncer transaction pooling reduced CPU to 28% and capped p99 latency at 12ms.\n• Action: Deploy PgBouncer sidecars across production by Q3.',
      badge: 'In-Editor Action',
    },
    {
      id: 1,
      name: 'Rewrite',
      icon: PenTool,
      tagline: 'Technical prose & RFC formatting',
      desc: 'Polish rough developer scratchpads into clean technical documentation, customer-ready changelogs, or executive memos.',
      inputLabel: 'Rough Scratchpad',
      inputText:
        'so the queue was backing up big time because the redis stream was blocked by slow consumers. we need to fix this asap before black friday or else orders will drop.',
      outputLabel: 'Refined Technical RFC',
      outputText:
        'Incident Analysis: Redis stream consumer throughput degraded under peak ingestion. Remediation requires decoupling consumer worker concurrency and implementing backpressure buffering prior to peak traffic events.',
      badge: 'Style Calibration',
    },
    {
      id: 2,
      name: 'Generate tags',
      icon: Hash,
      tagline: 'Automated taxonomy & keywords',
      desc: 'Extract multi-dimensional keywords and hierarchical tags from note content to keep your knowledge graph continuously organized.',
      inputLabel: 'Uncategorized Note',
      inputText:
        'Notes on implementing zero-knowledge proof verification inside our WebAssembly client using snarkjs and Groth16 circuits with browser IndexedDB caching...',
      outputLabel: 'Synthesized Tags',
      outputText:
        'Suggested Vault Tags:\n#cryptography  #zero-knowledge  #zk-snark  #webassembly  #groth16  #indexeddb  #client-security',
      badge: 'Taxonomy Engine',
    },
    {
      id: 3,
      name: 'Generate titles',
      icon: Heading,
      tagline: 'Informative, structured naming',
      desc: 'Never leave notes named "Untitled 14". Generate informative, structured titles that capture the exact substance of your writing.',
      inputLabel: 'Untitled Note Content',
      inputText:
        'Benchmarking NVMe SSD write amplification factors against RocksDB LSM trees vs InnoDB B+ trees under 95% write-heavy transactional workloads...',
      outputLabel: 'Suggested Titles',
      outputText:
        '1. LSM-Tree vs B+Tree: NVMe Write Amplification Benchmarks\n2. RocksDB vs InnoDB: Write-Heavy Workload Performance Analysis\n3. SSD Wear & Write Amplification in Modern Storage Engines',
      badge: 'High Signal',
    },
    {
      id: 4,
      name: 'Explain concepts',
      icon: HelpCircle,
      tagline: 'Deconstruct complex math & algorithms',
      desc: 'Break down complex mathematical formulations, cryptographic primitives, or dense algorithmic proofs into intuitive mental models.',
      inputLabel: 'Dense Academic Excerpt',
      inputText:
        'Paxos consensus operates in two phases: Prepare (promises with proposal number n) and Accept (commit if majority quorum approves without higher proposal seen)...',
      outputLabel: 'Structured Mental Model',
      outputText:
        'Intuitive breakdown:\n1. Phase 1 (Reservation): "Can I propose value n? Promise me you will ignore anyone older."\n2. Phase 2 (Vote): "If a majority agreed, here is value v to lock in."\nWhy it works: Overlapping quorums mathematically guarantee no two conflicting values reach consensus.',
      badge: 'Pedagogical AI',
    },
    {
      id: 5,
      name: 'Cross-document compare',
      icon: MessageSquareCode,
      tagline: 'Synthesize across multiple years',
      desc: 'Query your entire archive as an interconnected brain. Compare findings between notes written years apart with exact source citations.',
      inputLabel: 'Cross-Note Query',
      inputText:
        'What was our decision regarding MinIO multi-site replication vs AWS S3 backup in the Q1 infrastructure review?',
      outputLabel: 'Cross-Document Synthesis',
      outputText:
        'Cross-referencing [RFC-032] and [Q1-Infra-Review]:\nYou decided to retain MinIO on-premise for active daily attachments (saving ~$1,800/mo) while running an asynchronous overnight mirror to cold S3 Glacier for catastrophe recovery.',
      badge: 'Archive RAG',
    },
  ];

  const current = tools[selectedTool];

  return (
    <section id="ai-engine" className="py-24 md:py-32 lg:py-36 bg-[#09090b] border-t border-zinc-800/80 relative">
      <span id="ai-tools" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>In-Editor Operations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Targeted actions inside your editor.<br />
            <span className="text-zinc-500">Transform, extract, and synthesize on demand.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Trigger discrete model operations directly from the editing cursor: summarize lengthy postmortems, generate structured taxonomy tags, reformat rough notes into technical RFCs, or explain dense math formulations.
          </p>
        </div>

        {/* Action Picker Ribbon */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                id={`ai-tool-pill-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs sm:text-[13px] font-medium transition-all cursor-pointer min-h-[40px] ${
                  isSelected
                    ? 'bg-white text-black border-white font-semibold shadow-sm'
                    : 'bg-[#121214] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-zinc-400'}`} />
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Action Canvas */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 lg:p-10 xl:p-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 mb-6 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {current.name} &bull; <span className="text-zinc-400 font-normal">{current.tagline}</span>
              </h3>
            </div>

            {/* Provider Toggle */}
            <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-full border border-zinc-800 text-xs font-mono self-start sm:self-auto">
              <button
                id="provider-toggle-ollama"
                onClick={() => setSelectedProvider('ollama')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedProvider === 'ollama'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ollama (Offline)
              </button>
              <button
                id="provider-toggle-gemini"
                onClick={() => setSelectedProvider('gemini')}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  selectedProvider === 'gemini'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Gemini (Cloud)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Input Note Excerpt */}
            <div className="lg:col-span-6 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono text-zinc-400">
                  <span>{current.inputLabel}</span>
                  <span className="text-zinc-500">Editor State</span>
                </div>
                <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed font-mono whitespace-pre-line bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/80">
                  {current.inputText}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
                <span>Cursor: Line 42</span>
                <span className="text-zinc-400">Ctrl + Shift + K</span>
              </div>
            </div>

            {/* AI Synthesized Output */}
            <div className="lg:col-span-6 bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 flex flex-col justify-between space-y-4 border-l-2 border-l-sky-400 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono">
                  <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {current.outputLabel}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {selectedProvider === 'ollama' ? 'Llama 3.3 70B' : 'Gemini 2.5 Flash'}
                  </span>
                </div>
                <div className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed font-mono whitespace-pre-line bg-zinc-900/90 p-4 rounded-lg border border-zinc-800 text-emerald-300/95">
                  {current.outputText}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/60">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Deterministic Grounding
                </span>
                <span className="text-zinc-500">Latency: 142ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
