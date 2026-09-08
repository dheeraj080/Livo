'use client';

import React, { useState } from 'react';
import { Shield, Lock, Cpu, Sparkles, Server, Check, ArrowRight, Code, Key } from 'lucide-react';

export function PrivacySection() {
  const [selectedProvider, setSelectedProvider] = useState<'local' | 'cloud'>('local');

  return (
    <section id="privacy" className="py-24 bg-[#09090b] border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400 font-mono mb-4">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Data Autonomy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            AI without giving up ownership.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            You don&apos;t have to sacrifice modern AI intelligence to keep your data private. livo gives you architectural choice over where and how your prompts are processed.
          </p>
        </div>

        {/* Provider Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* OPTION 1: LOCAL AI (Ollama) */}
          <div
            id="privacy-card-local"
            className={`rounded-xl border p-6 sm:p-8 transition-all cursor-pointer ${
              selectedProvider === 'local'
                ? 'bg-[#18181b] border-zinc-600 shadow-sm'
                : 'bg-[#121214] border-zinc-800 hover:border-zinc-700'
            }`}
            onClick={() => setSelectedProvider('local')}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 font-medium">
                100% Air-Gapped Option
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Local AI Engine via Ollama
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Run models like Llama 3.3, Mistral, Gemma, or Qwen directly on your server&apos;s CPU or GPU. Prompts and note embeddings never leave your local physical machine.
            </p>

            <div className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-5">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Zero outbound bytes — runs seamlessly without an active internet connection.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Zero recurring subscription or API token costs.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Fully auditable inference running in your own Docker container.</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-500">
              Ideal for: Confidential research, health journals, proprietary source code.
            </div>
          </div>

          {/* OPTION 2: CLOUD AI (Gemini) */}
          <div
            id="privacy-card-cloud"
            className={`rounded-xl border p-6 sm:p-8 transition-all cursor-pointer ${
              selectedProvider === 'cloud'
                ? 'bg-[#18181b] border-zinc-600 shadow-sm'
                : 'bg-[#121214] border-zinc-800 hover:border-zinc-700'
            }`}
            onClick={() => setSelectedProvider('cloud')}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 font-medium">
                Direct API Key
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Cloud AI via Gemini API
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Connect your own direct Gemini API key for massive 1M+ token context windows and cutting-edge reasoning across large multi-year archives.
            </p>

            <div className="space-y-3 text-xs text-zinc-300 border-t border-zinc-800/80 pt-5">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Direct client-to-API communication with zero livo intermediary proxy servers.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Enterprise API terms guarantee user inputs are not used to train models.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Massive multi-document cross-synthesis across entire PDF libraries.</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-500">
              Ideal for: Heavy reasoning tasks, huge context synthesis, low-spec servers.
            </div>
          </div>
        </div>

        {/* Pluggable Architecture Breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-[#121214] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 font-medium uppercase mb-1">
                <Code className="w-3.5 h-3.5 text-zinc-400" />
                <span>Pluggable Provider Pattern</span>
              </div>
              <h4 className="text-base font-semibold text-white">
                Switch AI engines with a single environment variable
              </h4>
            </div>
            <span className="text-xs font-mono text-zinc-300 bg-[#18181b] px-3.5 py-1.5 rounded-full border border-zinc-800 w-fit">
              AI_PROVIDER=ollama | gemini | custom
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-zinc-400">
            <div>
              <h5 className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                Key Sovereignty
              </h5>
              <p className="leading-relaxed">
                Your API keys are stored in your private local <code className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded font-mono">.env</code> file. No third party ever touches your credentials or monitors your call volume.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-zinc-400" />
                Transparent Residency
              </h5>
              <p className="leading-relaxed">
                All note chunks, vector indexes, and media blobs remain stored inside your Docker volumes. You can inspect the database directly using psql anytime.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                Honest Security Posture
              </h5>
              <p className="leading-relaxed">
                We make no mythical claims of &ldquo;unhackable magic.&rdquo; We provide transparent open-source code, reproducible builds, and standard Linux security practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
