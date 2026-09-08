'use client';

import React, { useState } from 'react';
import { BookOpen, Terminal, Code2, Copy, Check } from 'lucide-react';

export function DocsPreviewSection() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'env' | 'api'>('quickstart');
  const [copied, setCopied] = useState(false);

  const envSample = `# Core Database & Services
DATABASE_URL=postgres://livo:password@postgres:5432/livo_db
ELASTICSEARCH_URL=http://elasticsearch:9200
MINIO_ENDPOINT=minio:9000
REDIS_URL=redis://redis:6379

# Pluggable AI Configuration
# Options: 'ollama' (100% offline) or 'gemini' (cloud with direct key)
AI_PROVIDER=ollama
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=llama3.3:70b

# Optional: Cloud AI via Gemini API key
# GEMINI_API_KEY=AIzaSy...

# Security & Storage
ENCRYPTION_KEY=64_char_hex_secret_for_vault_aes_gcm
JWT_SECRET=production_random_token_string`;

  const apiSample = `// POST /api/v1/search/hybrid
curl -X POST http://localhost:3000/api/v1/search/hybrid \\
  -H "Authorization: Bearer $livo_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "what did I write about scaling databases?",
    "topK": 5,
    "minScore": 0.75,
    "notebookFilter": ["Database Internals", "Architecture RFCs"]
  }'`;

  return (
    <section id="docs" className="py-24 md:py-32 lg:py-36 bg-[#09090b] border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
            <span>Documentation & API</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Developer guides & reference.<br />
            <span className="text-zinc-500">Fast to deploy, simple to script.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Clear, copyable configurations for Docker Compose, environment variables, and the OpenAPI REST endpoints.
          </p>
        </div>

        {/* Documentation Tab Viewer */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-4 bg-[#121214] border-b border-zinc-800 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('quickstart')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-mono transition-colors cursor-pointer min-h-[32px] ${
                  activeTab === 'quickstart'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Installation
              </button>
              <button
                onClick={() => setActiveTab('env')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-mono transition-colors cursor-pointer min-h-[32px] ${
                  activeTab === 'env'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                .env.production
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-mono transition-colors cursor-pointer min-h-[32px] ${
                  activeTab === 'api'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                REST API (Hybrid Search)
              </button>
            </div>

            <button
              onClick={() => {
                const text =
                  activeTab === 'env'
                    ? envSample
                    : activeTab === 'api'
                    ? apiSample
                    : 'git clone https://github.com/dheeraj080/Livo && cd livo && docker compose up -d';
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer self-end sm:self-auto min-h-[32px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy contents</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            {activeTab === 'quickstart' && (
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Deploy the full livo sovereign stack on your local machine, homelab, or cloud VPS with a single command:
                </p>
                <div className="bg-[#18181b] rounded-xl border border-zinc-800 p-5 font-mono text-xs sm:text-[13px] text-zinc-200 overflow-x-auto leading-relaxed">
                  <span className="text-zinc-500"># 1. Clone repository</span>{'\n'}
                  git clone https://github.com/livo-notes/livo.git{'\n'}
                  cd livo{'\n\n'}
                  <span className="text-zinc-500"># 2. Launch production stack in background</span>{'\n'}
                  docker compose up -d{'\n\n'}
                  <span className="text-zinc-500"># 3. Open browser</span>{'\n'}
                  open http://localhost:3000
                </div>
              </div>
            )}

            {activeTab === 'env' && (
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Example environment configuration file for self-hosted instances. Configure database credentials, AI provider choices, and storage volumes:
                </p>
                <div className="bg-[#18181b] rounded-xl border border-zinc-800 p-5 font-mono text-xs sm:text-[13px] text-zinc-300 overflow-x-auto max-h-[380px] leading-relaxed">
                  <pre>
                    <code>{envSample}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Execute hybrid semantic + lexical searches over your entire knowledge vault using the REST API:
                </p>
                <div className="bg-[#18181b] rounded-xl border border-zinc-800 p-5 font-mono text-xs sm:text-[13px] text-zinc-300 overflow-x-auto leading-relaxed">
                  <pre>
                    <code>{apiSample}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
