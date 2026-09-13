'use client';

import React from 'react';
import { Github, ArrowRight } from 'lucide-react';
import { HeroAppMockup } from './HeroAppMockup';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#09090b] pt-32 pb-24 md:pt-44 md:pb-36 lg:pt-48 lg:pb-40"
    >
      {/* Subtle architectural background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(39, 39, 42, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(39, 39, 42, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage:
            'radial-gradient(ellipse 65% 55% at 50% 0%, black 55%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 65% 55% at 50% 0%, black 55%, transparent 100%)',
        }}
      />

      {/* Ambient glow behind the product mockup */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[350px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.04] blur-[120px]" />

      {/* Additional subtle center glow */}
      <div className="pointer-events-none absolute left-1/2 top-[55%] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.015] blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Headline & Value Proposition */}
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[76px]">
            Your knowledge.
            <br />
            Your AI.
            <br />
            <span className="text-zinc-500">Your infrastructure.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-zinc-300 sm:text-lg lg:text-[19px]">
            A self-hosted AI knowledge platform for developers and teams who
            want their knowledge, AI, and infrastructure under their control.
            Search, synthesize, and build across your documents with local
            models, private keys, and zero vendor lock-in.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <button
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-zinc-200 sm:text-[15px]"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <a
              href="https://github.com/dheeraj080/livo"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-github-btn"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-white sm:text-[15px]"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Trust / Positioning Metadata */}
          <div className="pt-3 font-mono text-xs text-zinc-400 sm:text-sm">
            <span>Self-hosted via Docker</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span>Hybrid Search + Citations</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span>Pluggable Local &amp; Cloud AI</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span>100% Data Ownership</span>
          </div>
        </div>

        {/* Product UI Mockup */}
        <div className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-2.5 shadow-2xl shadow-black/80 ring-1 ring-white/5 backdrop-blur-sm sm:p-4">
            <HeroAppMockup />
          </div>
        </div>
      </div>
    </section>
  );
}