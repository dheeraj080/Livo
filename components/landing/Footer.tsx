'use client';

import React from 'react';
import { Cloud, Github, Terminal, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onGetStarted: () => void;
}

export function Footer({ onGetStarted }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-[#09090b] border-t border-zinc-800/50 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">livo</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18181b] text-zinc-400 border border-zinc-800">
                v0.9.4
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              The self-hostable personal knowledge workspace. Hybrid semantic search, grounded AI assistance, and 100% data ownership on your own hardware.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/dheeraj080/livo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-[#121214] border border-zinc-800 text-zinc-300 hover:text-white hover:bg-[#18181b] transition-colors"
                aria-label="livo GitHub repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <button
                onClick={onGetStarted}
                className="p-2.5 rounded-full bg-[#121214] border border-zinc-800 text-zinc-300 hover:text-white hover:bg-[#18181b] transition-colors cursor-pointer"
                aria-label="Terminal Quickstart"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs font-mono uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#product" className="hover:text-white transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#search" className="hover:text-white transition-colors">
                  Hybrid Search
                </a>
              </li>
              <li>
                <a href="#ai" className="hover:text-white transition-colors">
                  Grounded AI
                </a>
              </li>
              <li>
                <a href="#ai-tools" className="hover:text-white transition-colors">
                  Editor AI Tools
                </a>
              </li>
              <li>
                <a href="#product" className="hover:text-white transition-colors">
                  Universal Attachments
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Self-Hosting & Docs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs font-mono uppercase tracking-wider">Self-Hosting</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#self-hosting" className="hover:text-white transition-colors">
                  Docker Compose
                </a>
              </li>
              <li>
                <button
                  onClick={onGetStarted}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Quickstart Guide
                </button>
              </li>
              <li>
                <a href="#self-hosting" className="hover:text-white transition-colors">
                  Hardware Requirements
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Ollama Local Setup
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200 text-xs font-mono uppercase tracking-wider">Open Source</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/dheeraj080/livo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  GitHub Repository
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#open-source" className="hover:text-white transition-colors">
                  MIT License
                </a>
              </li>
              <li>
                <a href="#open-source" className="hover:text-white transition-colors">
                  Security Disclosures
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-white transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 font-mono text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} livo Knowledge Engine. Open-source under MIT License.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Independent Self-Hosted Engine</span>
            </span>
            <span>&bull;</span>
            <span>Zero Outbound Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
