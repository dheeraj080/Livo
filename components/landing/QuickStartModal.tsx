'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Terminal, ExternalLink, ShieldCheck, HardDrive, Cpu } from 'lucide-react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickStartModal({ isOpen, onClose }: QuickStartModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Clone the repository',
      command: 'git clone https://github.com/dheeraj080/livo && cd livo',
      desc: 'Get the official open-source compose configuration and default environment variables.',
    },
    {
      title: '2. Launch the infrastructure stack',
      command: 'docker compose up -d',
      desc: 'Spins up livo Server, PostgreSQL with pgvector, Elasticsearch, MinIO, and Redis.',
    },
    {
      title: '3. Open the web interface',
      command: 'open http://localhost:3000',
      desc: 'Complete initial vault setup in 30 seconds. Choose local Ollama or your private Gemini key.',
    },
  ];

  return (
    <div
      id="quickstart-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="quickstart-modal-container"
        className="relative w-full max-w-2xl bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#18181b] text-zinc-300 border border-zinc-800">
                Self-Host in 60s
              </span>
              <span className="text-xs text-zinc-400 font-mono">MIT License</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Get Started with livo</h3>
          </div>
          <button
            id="close-quickstart-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-200">{step.title}</span>
                <span className="text-xs text-zinc-500">{step.desc}</span>
              </div>
              <div className="flex items-center justify-between bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-zinc-300">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Terminal className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="select-all text-zinc-200">{step.command}</span>
                </div>
                <button
                  id={`copy-step-${idx}-btn`}
                  onClick={() => copyToClipboard(step.command, idx)}
                  className="ml-3 shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18181b] border border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">100% Local Data</p>
              <p className="text-[11px] text-zinc-500">Your notes stay in your private Docker volumes.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18181b] border border-zinc-800">
            <Cpu className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Pluggable AI</p>
              <p className="text-[11px] text-zinc-500">Switch between local Ollama and Gemini API.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18181b] border border-zinc-800">
            <HardDrive className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Any Hardware</p>
              <p className="text-[11px] text-zinc-500">Runs smoothly on Raspberry Pi, VPS, or cloud.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://github.com/dheeraj080/livo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            Read documentation & compose reference
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            id="done-quickstart-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    </div>
  );
}
