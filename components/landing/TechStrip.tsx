'use client';

import React from 'react';
import { Database, Search, Edit3, Sparkles, Cpu, HardDrive, Layers, CheckCircle } from 'lucide-react';

export function TechStrip() {
  const technologies = [
    {
      name: 'PostgreSQL',
      role: 'Relational & pgvector',
      desc: 'ACID transactional metadata, notebook hierarchies, and dense vector embeddings.',
      icon: Database,
      badge: 'Relational Core',
    },
    {
      name: 'Elasticsearch',
      role: 'Hybrid Retrieval',
      desc: 'BM25 keyword matching combined with dense vector scoring for sub-50ms search.',
      icon: Search,
      badge: 'BM25 + Semantic',
    },
    {
      name: 'Tiptap',
      role: 'Rich-Text Engine',
      desc: 'Headless, extensible Markdown and rich-text editing with real-time state sync.',
      icon: Edit3,
      badge: 'Editor Kernel',
    },
    {
      name: 'Ollama',
      role: 'Local LLM Inference',
      desc: 'Run Llama 3, Mistral, or Qwen completely offline on your own CPU/GPU hardware.',
      icon: Cpu,
      badge: '100% Offline AI',
    },
    {
      name: 'Gemini',
      role: 'High-Context Cloud AI',
      desc: 'Connect your private API key for massive 1M+ token context windows across research libraries.',
      icon: Sparkles,
      badge: 'Optional Cloud AI',
    },
    {
      name: 'MinIO',
      role: 'S3-Compatible Object Store',
      desc: 'Self-hosted asset storage for PDFs, audio attachments, diagrams, and encrypted exports.',
      icon: HardDrive,
      badge: 'Private Blobs',
    },
    {
      name: 'Redis',
      role: 'Cache & Job Queues',
      desc: 'Instant full-text query caching, OCR background worker pipelines, and embedding buffers.',
      icon: Layers,
      badge: 'In-Memory State',
    },
  ];

  return (
    <section
      id="technologies"
      className="py-16 border-y border-zinc-800/80 bg-[#09090b] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              Transparent Technical Architecture
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Engineered on battle-tested open foundations
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            livo integrates industry-standard open-source systems. No custom proprietary databases, no vendor lock-in, and zero black-box storage engines.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                id={`tech-item-${tech.name.toLowerCase()}`}
                className="group relative rounded-xl border border-zinc-800 bg-[#121214] hover:bg-[#18181b] p-4 transition-all duration-200 hover:border-zinc-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                      <Icon className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {tech.badge}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">
                    {tech.name}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400 mb-2">{tech.role}</p>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800/80">
                  {tech.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 text-center font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Technologies shown reflect livo modular backend architecture. Independent open-source integration.</span>
        </div>
      </div>
    </section>
  );
}
