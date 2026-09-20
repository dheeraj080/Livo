'use client';

import React from 'react';
import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';
import { HeroAppMockup } from './HeroAppMockup';
import { useHydrated } from '@/hooks/use-hydrated';

export function Hero() {
  const mounted = useHydrated();

  return (
    <section
      id="hero"
      className="relative pt-32 pb-24 md:pt-44 md:pb-36 lg:pt-48 lg:pb-40 overflow-hidden"
    >
      {/* Subtle developer architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient background glow behind the mockup */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow - ~50ms delay */}
        <div
          className={`flex justify-center mb-6 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[50ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
          } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="font-mono text-[11px] sm:text-xs text-zinc-300 font-semibold tracking-wider uppercase">
              SELF-HOSTED • OPEN INFRASTRUCTURE
            </span>
          </div>
        </div>

        {/* Headline & Value Proposition */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Headline - ~100ms delay */}
          <h1
            className={`text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-white leading-[1.08] transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[100ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
          >
            Your knowledge.<br />
            Your AI.<br />
            <span className="text-zinc-500">Your infrastructure.</span>
          </h1>

          {/* Supporting copy - ~150ms delay */}
          <p
            className={`text-base sm:text-lg lg:text-[19px] text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[150ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
          >
            An extensible personal knowledge base running on your own server with Docker, PostgreSQL, Redis, Elasticsearch, and S3-compatible storage.
          </p>

          {/* Primary & Secondary CTAs - ~200ms delay */}
          <div
            className={`flex flex-wrap items-center justify-center gap-3.5 pt-2 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[200ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
          >
            <Link
              href="/app"
              id="hero-get-started-btn"
              className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-6 py-2.5 rounded-full text-sm sm:text-[15px] font-semibold hover:bg-zinc-200 transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] cursor-pointer min-h-[44px] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-github-btn"
              className="inline-flex items-center justify-center gap-2 border border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-800/60 px-5 py-2.5 rounded-full text-sm sm:text-[15px] font-medium transition-all duration-200 ease-out active:scale-[0.98] min-h-[44px] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Prominent Product UI Mockup - ~250ms delay, translateY 12px -> 0, subtle hover */}
        <div
          className={`mt-16 sm:mt-20 max-w-6xl mx-auto relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[250ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
        >
          <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-2.5 sm:p-4 backdrop-blur-sm shadow-2xl shadow-black/80 ring-1 ring-white/5 transition-all duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] motion-reduce:hover:translate-y-0">
            <HeroAppMockup />
          </div>

          {/* Subtle Deployment Indicator - ~300ms delay */}
          <div
            className={`mt-6 flex items-center justify-center transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[300ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-4 py-2 rounded-full border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Docker Compose
              </span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-300 font-semibold">Nimbus</span>
              <span className="text-zinc-600">·</span>
              <span>PostgreSQL</span>
              <span className="text-zinc-600">·</span>
              <span>Redis</span>
              <span className="text-zinc-600">·</span>
              <span>Elasticsearch</span>
              <span className="text-zinc-600">·</span>
              <span>MinIO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
