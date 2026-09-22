'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Terminal, ExternalLink, Shield, HardDrive, Cpu } from 'lucide-react';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickStartModal({ isOpen, onClose }: QuickStartModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Clone the repository',
      command: 'git clone https://github.com/nimbus-notes/nimbus.git && cd nimbus',
      desc: 'Get the official Docker Compose configuration and default environment files.',
    },
    {
      title: '2. Configure environment',
      command: 'cp .env.example .env',
      desc: 'Set your database passwords, search credentials, and optional AI keys.',
    },
    {
      title: '3. Launch with Docker Compose',
      command: 'docker compose up -d',
      desc: 'Spins up Nimbus, PostgreSQL, Redis, Elasticsearch, and MinIO in the background.',
    },
    {
      title: '4. Open web interface',
      command: 'http://localhost:3000',
      desc: 'Access your self-hosted knowledge workspace and connect your notes.',
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
                Docker Compose Stack
              </span>
              <span className="text-xs text-zinc-400 font-mono">MIT License</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Deploy Nimbus with Docker</h3>
          </div>
          <button
            id="close-quickstart-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-zinc-200">{step.title}</span>
                <span className="text-[11px] sm:text-xs text-zinc-500 hidden sm:inline">{step.desc}</span>
              </div>
              <div className="flex items-center justify-between bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-xs text-zinc-300">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="select-all text-zinc-200">{step.command}</span>
                </div>
                <button
                  id={`copy-step-${idx}-btn`}
                  onClick={() => copyToClipboard(step.command, idx)}
                  className="ml-3 shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all duration-150 cursor-pointer text-xs"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-sans">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="font-sans">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18181b] border border-zinc-800">
            <Shield className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Data Ownership</p>
              <p className="text-[11px] text-zinc-500">Your notes stay in your private Docker volumes.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18181b] border border-zinc-800">
            <Cpu className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Pluggable AI</p>
              <p className="text-[11px] text-zinc-500">Choose between local Ollama and Gemini API.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#18181b] border border-zinc-800">
            <HardDrive className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Standard Infrastructure</p>
              <p className="text-[11px] text-zinc-500">PostgreSQL, Redis, Elasticsearch, and MinIO.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://github.com"
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
            className="w-full sm:w-auto px-5 py-2 bg-white text-black hover:bg-zinc-200 active:scale-95 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
