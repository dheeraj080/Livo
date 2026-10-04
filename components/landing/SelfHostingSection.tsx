'use client';

import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Layers,
  Terminal,
  Copy,
  Check,
  ArrowDown,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export function SelfHostingSection() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const { ref: archRef, isRevealed: archRevealed } = useScrollReveal({ rootMargin: '0px 0px -60px 0px' });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const primaryCommand = 'docker compose up -d';

  const infraCards = [
    {
      name: 'PostgreSQL',
      role: 'Source of truth',
      desc: 'Your notes, notebooks, metadata, and application data remain in PostgreSQL.',
      icon: Database,
      badge: 'Relational Store',
    },
    {
      name: 'Redis',
      role: 'Background processing',
      desc: 'BullMQ uses Redis to process asynchronous jobs without blocking the main application.',
      icon: Cpu,
      badge: 'Task Queue',
    },
    {
      name: 'Elasticsearch',
      role: 'Fast search',
      desc: 'Elasticsearch provides full-text search while PostgreSQL remains the authoritative data store.',
      icon: Layers,
      badge: 'Search Index',
    },
    {
      name: 'MinIO / S3',
      role: 'Your files',
      desc: 'Attachments and uploaded documents use S3-compatible object storage such as MinIO.',
      icon: HardDrive,
      badge: 'Object Storage',
    },
  ];

  const deploymentSteps = [
    {
      step: '1',
      title: 'Clone',
      detail: 'git clone https://github.com/livo-notes/livo.git',
    },
    {
      step: '2',
      title: 'Configure .env',
      detail: 'cp .env.example .env',
    },
    {
      step: '3',
      title: 'docker compose up -d',
      detail: 'Start all services in background',
      highlight: true,
    },
    {
      step: '4',
      title: 'Open livo',
      detail: 'http://localhost:3000',
    },
  ];

  return (
    <section id="self-hosting" className="py-12 sm:py-14 md:py-16 lg:py-20 bg-[#09090b] border-t border-zinc-800/40 relative scroll-mt-20">
      <span id="privacy" className="scroll-mt-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="max-w-3xl mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs sm:text-[13px] text-zinc-400 font-mono mb-3 sm:mb-3.5">
            <Server className="w-3.5 h-3.5 text-sky-400" />
            <span>SELF-HOSTED DOCKER COMPOSE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold tracking-tight text-white leading-[1.15]">
            Your infrastructure. Your data.
          </h2>
          <p className="mt-3 sm:mt-3.5 text-base sm:text-lg lg:text-[19px] text-zinc-400 leading-relaxed max-w-2xl">
            livo is designed to run on infrastructure you control. Deploy the complete stack with Docker Compose and operate your notes, documents, attachments, search index, and AI configuration directly.
          </p>
        </ScrollReveal>

        {/* 1. Actual Architecture Stack Diagram - Subtle sequential reveal */}
        <div ref={archRef} className="rounded-2xl border border-zinc-800 bg-[#121214] shadow-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-5 relative">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-[13px] text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Complete Stack Architecture</span>
            </div>
            <span className="text-xs font-mono text-zinc-500">One Docker Compose network</span>
          </div>

          {/* Diagram Layout */}
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            {/* Top Node: livo */}
            <div
              className={`w-full max-w-xs p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-center shadow-lg relative group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                archRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
            >
              <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider font-semibold mb-1">
                Application Layer
              </div>
              <div className="text-base sm:text-lg font-bold text-white">livo</div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">Next.js Web App & API</div>
            </div>

            {/* Connecting Vertical Line & Branches */}
            <div
              className={`w-full flex flex-col items-center transition-opacity duration-400 delay-[100ms] ${
                archRevealed ? 'opacity-100' : 'opacity-0'
              } motion-reduce:!opacity-100 motion-reduce:!transition-none`}
            >
              <div className="w-0.5 h-8 bg-zinc-700 my-1 hidden sm:block" />
              <div className="hidden sm:block w-full max-w-2xl border-t border-zinc-700 relative mb-4">
                <div className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-zinc-700" />
                <div className="absolute -top-1.5 left-1/3 -ml-1 w-3 h-3 rounded-full bg-zinc-700" />
                <div className="absolute -top-1.5 left-2/3 -ml-1 w-3 h-3 rounded-full bg-zinc-700" />
                <div className="absolute -top-1.5 right-0 w-3 h-3 rounded-full bg-zinc-700" />
              </div>

              {/* Down arrows on mobile */}
              <div className="sm:hidden flex items-center justify-center my-3 text-zinc-600">
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* Supporting Services Nodes - Sequential Stagger */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                className={`p-3.5 sm:p-4 rounded-xl bg-[#18181b] border border-zinc-800 text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[160ms] ${
                  archRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-300 mb-2">
                  <Database className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-sm font-bold text-white font-mono">PostgreSQL</div>
                <div className="text-xs text-zinc-400 mt-1">Source of truth</div>
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-xl bg-[#18181b] border border-zinc-800 text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[220ms] ${
                  archRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-300 mb-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-white font-mono">Redis</div>
                <div className="text-xs text-zinc-400 mt-1">BullMQ task queue</div>
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-xl bg-[#18181b] border border-zinc-800 text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[280ms] ${
                  archRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-300 mb-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-bold text-white font-mono">Elasticsearch</div>
                <div className="text-xs text-zinc-400 mt-1">Full-text search</div>
              </div>

              <div
                className={`p-3.5 sm:p-4 rounded-xl bg-[#18181b] border border-zinc-800 text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[340ms] ${
                  archRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-zinc-300 mb-2">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-sm font-bold text-white font-mono">MinIO / S3</div>
                <div className="text-xs text-zinc-400 mt-1">Object file storage</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Infrastructure Detail Cards */}
        <ScrollReveal delay={60} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-4 sm:mb-5">
          {infraCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#121214] border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200">
                      <Icon className="w-4 h-4 text-sky-400" />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-mono">{card.name}</h3>
                  <p className="text-xs font-semibold text-zinc-300 mt-1 mb-2.5">{card.role}</p>
                  <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </ScrollReveal>

        {/* 3. Compact Deployment Flow */}
        <ScrollReveal delay={100} className="rounded-2xl border border-zinc-800 bg-[#121214] p-4 sm:p-6 lg:p-7 mb-4 sm:mb-5">
          <div className="max-w-2xl mb-4 sm:mb-5">
            <div className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold mb-1">
              DEPLOYMENT FLOW
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Configure once. Start the complete stack with Docker Compose.
            </h3>
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
            {deploymentSteps.map((step, idx) => (
              <div
                key={step.step}
                className={`p-4 rounded-xl border flex flex-col justify-between relative ${
                  step.highlight
                    ? 'bg-zinc-900 border-sky-500/50 shadow-md ring-1 ring-sky-500/20'
                    : 'bg-[#18181b] border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-500 font-bold">STEP {step.step}</span>
                    {idx < 3 && (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 hidden lg:block" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{step.title}</div>
                  <div className="text-xs font-mono text-zinc-400 mt-1">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prominent Docker Command Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#18181b] border border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
                <Terminal className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono">
                <div className="text-[11px] text-zinc-500">Primary Deployment Command</div>
                <code className="text-sm sm:text-base font-bold text-emerald-400">
                  {primaryCommand}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(primaryCommand, 'primary')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-[13px] font-mono text-zinc-200 transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                {copiedCmd === 'primary' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy command</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Helper Commands */}
          <div className="mt-3.5 pt-3.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Inspect logs: <code className="text-zinc-300">docker compose logs -f</code>
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span>
                Stop stack: <code className="text-zinc-300">docker compose down</code>
              </span>
            </div>
            <span className="text-zinc-500">Real compose workflow · No hidden steps</span>
          </div>
        </ScrollReveal>

        {/* 4. Data Ownership & Governance Statement */}
        <ScrollReveal delay={120} className="rounded-2xl border border-zinc-800 bg-[#121214] p-4 sm:p-6 lg:p-7">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>DATA GOVERNANCE & PRIVACY</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Keep control of your data.
            </h3>
            <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
              livo doesn&apos;t require your knowledge base to live on someone else&apos;s infrastructure. Run the application and its supporting services yourself and decide where your data and AI workloads live.
            </p>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Store notes and attachments in local Docker volumes, run inference through local models or direct API keys, and keep your data organized under your own operational terms.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
