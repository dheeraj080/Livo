'use client';

import React from 'react';
import { Terminal, Github, ArrowRight, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

export function FinalCTA({ onGetStarted }: FinalCTAProps) {
  return (
    <section id="cta" className="py-28 md:py-36 lg:py-40 bg-[#09090b] border-t border-zinc-800/50 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(24,24,27,0.5),transparent_100%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-[#121214] text-xs sm:text-[13px] text-zinc-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Production Ready v0.9.4 &bull; 100% Open Source</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
          Deploy livo on your private server.
        </h2>

        <p className="text-base sm:text-lg lg:text-[19px] text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
          Spin up your self-hosted instance in seconds with Docker Compose. Open source, zero telemetry, and fully extensible.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <button
            id="final-cta-get-started-btn"
            onClick={onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-sm sm:text-[15px] font-semibold shadow-md transition-colors cursor-pointer min-h-[44px]"
          >
            <Terminal className="w-4 h-4" />
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <a
            href="https://github.com/dheeraj080/Livo"
            target="_blank"
            rel="noopener noreferrer"
            id="final-cta-github-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-sm sm:text-[15px] font-medium transition-colors min-h-[44px]"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
            <span className="ml-1 text-xs font-mono text-zinc-500">★ 4.8k</span>
          </a>
        </div>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-xs sm:text-[13px] text-zinc-400 font-mono">
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-full bg-[#121214] border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
            <span>Zero Telemetry</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-full bg-[#121214] border border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-zinc-300" />
            <span>Pluggable Local & Cloud AI</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-3 rounded-full bg-[#121214] border border-zinc-800">
            <HardDrive className="w-3.5 h-3.5 text-zinc-300" />
            <span>Standard Docker Volumes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
