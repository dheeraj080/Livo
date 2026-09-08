'use client';

import React, { useState } from 'react';
import {
  Github,
  Code2,
  Database,
  Search,
  Check,
  Copy,
  Cpu,
  Share2,
  Terminal,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export function DeveloperSection() {
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedApi, setCopiedApi] = useState(false);
  const [activeApiTab, setActiveApiTab] = useState<'createNote' | 'hybridSearch' | 'aiQuery'>('createNote');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const cloneCmd = 'git clone https://github.com/dheeraj080/Livo && cd livo && docker compose up -d';

  const apiSnippets = {
    createNote: `// POST /api/v1/notes — Ingest or create note
curl -X POST http://localhost:3000/api/v1/notes \\
  -H "Authorization: Bearer $livo_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Ingestion Pipeline ADR",
    "notebook": "Architecture RFCs",
    "tags": ["redis", "workers", "ocr"],
    "content": "Decoupled upload writes raw files to MinIO and pushes tasks to Redis."
  }'`,
    hybridSearch: `// POST /api/v1/search/hybrid — BM25 + Vector scoring
curl -X POST http://localhost:3000/api/v1/search/hybrid \\
  -H "Authorization: Bearer $livo_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "what did we decide about ingestion architecture?",
    "topK": 3,
    "minScore": 0.72,
    "notebookFilter": ["Architecture RFCs"]
  }'`,
    aiQuery: `// POST /api/v1/ai/query — Grounded reasoning with citations
curl -X POST http://localhost:3000/api/v1/ai/query \\
  -H "Authorization: Bearer $livo_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Summarize our worker queue decisions",
    "provider": "ollama",
    "model": "llama3.3:70b"
  }'`,
  };

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(cloneCmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const copyApiSnippet = () => {
    navigator.clipboard.writeText(apiSnippets[activeApiTab]);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 2000);
  };

  const architectureTree = [
    {
      id: 'knowledge',
      name: 'Knowledge',
      icon: BookOpen,
      desc: 'Markdown / Tiptap engine, bidirectional backlinks, notebooks & tag taxonomy',
      tech: 'SQLite / PostgreSQL / Tiptap',
    },
    {
      id: 'search',
      name: 'Search',
      icon: Search,
      desc: 'BM25 lexical index, pgvector dense embeddings, and Reciprocal Rank Fusion',
      tech: 'Elasticsearch & pgvector',
    },
    {
      id: 'ai',
      name: 'AI',
      icon: Cpu,
      desc: 'Pluggable offline Ollama models (Llama 3.3) or direct private Gemini API',
      tech: 'Ollama / Gemini SDK',
    },
    {
      id: 'storage',
      name: 'Storage',
      icon: Database,
      desc: 'ACID relational metadata, MinIO S3 document attachments, and Redis task queues',
      tech: 'PostgreSQL / MinIO / Redis',
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: Share2,
      desc: 'OpenAPI REST & WebSocket endpoints, CLI sync scripts, and Raycast extensions',
      tech: 'REST / WebSocket / CLI',
    },
  ];

  return (
    <section id="developer" className="py-24 md:py-32 lg:py-36 bg-[#09090b] border-t border-zinc-800/80 relative">
      <span id="api" className="scroll-mt-24" />
      <span id="open-source" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>TECHNICAL TRANSPARENCY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Built to be understood.
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            A modular, API-first architecture designed to be inspected, extended, and integrated into your own systems.
          </p>
        </div>

        {/* Developer Console Visual */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 sm:p-6 border-b border-zinc-800 bg-zinc-900/40 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-white font-mono">livo-notes/livo</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    MIT License
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-0.5">
                  <span>★ 4.8k</span>
                  <span>·</span>
                  <span>TypeScript</span>
                  <span>·</span>
                  <span>0 Telemetry</span>
                </div>
              </div>
            </div>

            {/* Quick Clone Terminal Bar */}
            <div className="flex items-center gap-2 bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-[13px] font-mono text-zinc-300 max-w-xl flex-1 justify-between min-h-[44px]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-zinc-500 shrink-0">$</span>
                <span className="select-all truncate text-xs">{cloneCmd}</span>
              </div>
              <button
                id="copy-dev-clone-btn"
                onClick={copyCloneCmd}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Copy clone command"
              >
                {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Main Grid: Architecture Tree on Left, Realistic API on Right */}
          <div className="p-6 sm:p-8 lg:p-10 xl:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Architecture Tree Structure */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <span className="text-xs sm:text-[13px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                  Modular Architecture Map
                </span>
                <span className="text-xs font-mono text-zinc-500">5 Subsystems</span>
              </div>

              {/* Tree Container */}
              <div className="bg-[#18181b] rounded-xl border border-zinc-800/90 p-4 sm:p-5 font-mono text-xs sm:text-[13px] space-y-3.5">
                {/* Root Node */}
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>API (REST & WebSocket Engine)</span>
                </div>

                {/* Subsystems Tree Branches */}
                <div className="space-y-3 pl-2 border-l-2 border-zinc-800 ml-2">
                  {architectureTree.map((item) => {
                    const Icon = item.icon;
                    const isHovered = activeModule === item.id;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setActiveModule(item.id)}
                        onMouseLeave={() => setActiveModule(null)}
                        className={`p-3 rounded-lg border transition-all cursor-default ${
                          isHovered
                            ? 'bg-zinc-900 border-zinc-700 text-white'
                            : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-600 font-mono">├──</span>
                            <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="font-semibold text-zinc-100">{item.name}</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {item.tech}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans mt-1.5 pl-6 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Realistic API Code Sandbox */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-zinc-800 gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-full border border-zinc-800 text-xs font-mono">
                  <button
                    onClick={() => setActiveApiTab('createNote')}
                    className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer min-h-[32px] ${
                      activeApiTab === 'createNote'
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    POST /notes
                  </button>
                  <button
                    onClick={() => setActiveApiTab('hybridSearch')}
                    className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer min-h-[32px] ${
                      activeApiTab === 'hybridSearch'
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    POST /search/hybrid
                  </button>
                  <button
                    onClick={() => setActiveApiTab('aiQuery')}
                    className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer min-h-[32px] ${
                      activeApiTab === 'aiQuery'
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    POST /ai/query
                  </button>
                </div>

                <button
                  onClick={copyApiSnippet}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer self-end sm:self-auto min-h-[32px]"
                >
                  {copiedApi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 font-mono text-xs sm:text-[13px] text-zinc-300 overflow-x-auto leading-relaxed min-h-[240px]">
                <pre className="select-all">
                  <code>{apiSnippets[activeApiTab]}</code>
                </pre>
              </div>

              {/* Extensibility Footnote */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#18181b] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-[13px] text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Code2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    OpenAPI v3 schema exported directly at <code className="text-white font-mono text-xs">/api/docs.json</code>
                  </span>
                </div>
                <a
                  href="#docs"
                  className="text-sky-400 hover:text-sky-300 font-mono text-xs sm:text-[13px] inline-flex items-center gap-1 shrink-0"
                >
                  Explore Endpoints
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Integrated Developer Principles Bar */}
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-[13px] font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              <span>100% Strict TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Direct SQL & Index Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
              <span>Pluggable LLM Inference</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Zero Proprietary Formats</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
