'use client';

import React, { useState } from 'react';
import {
  User,
  AppWindow,
  Cpu,
  Server,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

export function SelfHostingSection() {
  const [copiedCompose, setCopiedCompose] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const quickCompose = `version: '3.8'

services:
  livo:
    image: ghcr.io/livo-notes/livo:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://livo:secret@postgres:5432/livo_db
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - AI_PROVIDER=ollama # or 'gemini'
      - OLLAMA_HOST=http://ollama:11434
    volumes:
      - ./data:/data
    restart: unless-stopped`;

  const copyCompose = () => {
    navigator.clipboard.writeText(quickCompose);
    setCopiedCompose(true);
    setTimeout(() => setCopiedCompose(false), 2000);
  };

  const ownershipTiers = [
    {
      step: '01',
      title: 'User',
      subtitle: 'Browser, desktop app & devices',
      icon: User,
      desc: 'Direct connection from your client devices over local network, HTTPS, or private VPN mesh.',
    },
    {
      step: '02',
      title: 'Application',
      subtitle: 'Workspace & markdown editor',
      icon: AppWindow,
      desc: 'Single unified web application handling note editing, document ingestion, and taxonomy.',
    },
    {
      step: '03',
      title: 'Knowledge / AI / Search',
      subtitle: 'Postgres, ES, MinIO & Ollama',
      icon: Cpu,
      desc: 'Document graphs, dense vector search, BM25 indexing, and local inference models.',
    },
    {
      step: '04',
      title: 'User-Controlled Infrastructure',
      subtitle: 'Homelab · Private VPS · Server',
      icon: Server,
      desc: 'Runs entirely on hardware and operating systems provisioned and administered by you.',
    },
  ];

  const keyPrinciples = [
    {
      title: 'You choose where the system runs',
      desc: 'Deploy on a local Raspberry Pi 5, homelab server, dedicated bare metal, or a private VPS. You are never tied to proprietary cloud platforms or subscription tiers.',
    },
    {
      title: 'You control your data and infrastructure',
      desc: 'All notes, raw documents, and vector embeddings reside on disks you manage. Storage uses standard open formats (PostgreSQL and filesystem storage) that you can inspect or back up anytime.',
    },
    {
      title: 'Integrate into your own environment',
      desc: 'Easily connect your instance with your existing local network, private WireGuard or Tailscale tunnels, cron backup scripts, and internal developer tooling.',
    },
  ];

  return (
    <section id="self-hosting" className="py-24 md:py-32 lg:py-36 bg-[#09090b] border-t border-zinc-800/80 relative">
      <span id="privacy" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-4">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>DATA OWNERSHIP & INFRASTRUCTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Your data. Your server.
          </h2>
          <p className="mt-4 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            Run your knowledge infrastructure where you want it—on infrastructure you control.
          </p>
        </div>

        {/* Large Sovereign Infrastructure Visual */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121214] shadow-2xl overflow-hidden mb-16">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-[13px] text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Sovereign Architecture Stack</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-500 hidden sm:inline">Self-Contained Deployment</span>
            </div>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs sm:text-[13px] font-mono text-zinc-300 transition-colors cursor-pointer self-start sm:self-auto min-h-[36px]"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>{showConfig ? 'View Architecture Flow' : 'View docker-compose.yml'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
            {showConfig ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-mono text-zinc-400">Minimal Single-Node Deployment</span>
                  <button
                    onClick={copyCompose}
                    className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCompose ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy compose</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#18181b] rounded-xl border border-zinc-800 p-5 sm:p-6 overflow-x-auto text-xs sm:text-[13px] font-mono text-zinc-300 leading-relaxed max-h-[380px]">
                  <pre className="select-all">
                    <code>{quickCompose}</code>
                  </pre>
                </div>
              </div>
            ) : (
              /* Conceptual Vertical Ownership Flow */
              <div className="relative">
                {/* Border Enclosure representing the User-Controlled Boundary */}
                <div className="rounded-xl border border-dashed border-zinc-700/80 bg-zinc-900/20 p-6 sm:p-8 lg:p-10 relative">
                  <div className="absolute -top-3.5 left-6 px-3.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] sm:text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
                    Your Private Infrastructure Boundary
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10 pt-2">
                    {ownershipTiers.map((tier) => {
                      const Icon = tier.icon;
                      return (
                        <div
                          key={tier.step}
                          className="flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-[#18181b] border border-zinc-800/90 shadow-sm relative group hover:border-zinc-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3.5">
                              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200">
                                <Icon className="w-4 h-4 text-sky-400" />
                              </div>
                              <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                                STEP {tier.step}
                              </span>
                            </div>

                            <h3 className="text-[15px] sm:text-base font-bold text-white tracking-tight">
                              {tier.title}
                            </h3>
                            <p className="text-xs font-mono text-zinc-400 mt-1 mb-3">
                              {tier.subtitle}
                            </p>
                          </div>

                          <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed pt-3 border-t border-zinc-800/80">
                            {tier.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-[13px] font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Zero external telemetry · Zero cloud lock-in · Full administrative access</span>
                    </div>
                    <span className="text-zinc-500 text-xs">
                      Stack: Docker / Postgres / Elasticsearch / MinIO
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 Concise Explanatory Statements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {keyPrinciples.map((item, idx) => (
            <div key={idx} className="space-y-3">
              <div className="text-xs sm:text-[13px] font-mono text-sky-400 font-semibold">
                0{idx + 1}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {item.title}
              </h3>
              <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
