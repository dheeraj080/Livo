'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { AISection } from '@/components/landing/AISection';
import { AIToolsSection } from '@/components/landing/AIToolsSection';
import { SelfHostingSection } from '@/components/landing/SelfHostingSection';
import { DeveloperSection } from '@/components/landing/DeveloperSection';
import { DocsPreviewSection } from '@/components/landing/DocsPreviewSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { QuickStartModal } from '@/components/landing/QuickStartModal';
import { ThemeProvider } from '@/packages/ui';
import { useHydrated } from '@/hooks/use-hydrated';

export function LandingPageContent() {
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const isMounted = useHydrated();

  return (
    <div
      className={`min-h-screen bg-background text-foreground antialiased font-sans relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
      } motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
    >
      {/* Background ambient orbs safely clipped within a background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-[28%] -right-24 w-[450px] h-[450px] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute top-[65%] -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main id="main-content" className="relative">
        {/* 1. HERO */}
        <Hero />

        {/* 2. THE PROBLEM */}
        <ProblemSection />

        {/* 3. ONE KNOWLEDGE LAYER */}
        <ProductSection />

        {/* 4. ASK YOUR KNOWLEDGE BASE */}
        <AISection />

        {/* 5. DATA OWNERSHIP / SELF-HOSTING */}
        <SelfHostingSection />

        {/* 6. AI CAPABILITIES */}
        <AIToolsSection />

        {/* 7. DEVELOPER / ARCHITECTURE */}
        <DeveloperSection />

        {/* 8. DOCUMENTATION / API */}
        <DocsPreviewSection />

        {/* 9. FINAL CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer onOpenQuickStart={() => setIsQuickStartOpen(true)} />

      {/* QuickStart Interactive Modal */}
      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingPageContent />
    </ThemeProvider>
  );
}
