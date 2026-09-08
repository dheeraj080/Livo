'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

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

export function LandingPageContent() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/app');
  };

  return (
    <div className="dark relative min-h-screen bg-background text-foreground font-sans antialiased transition-colors duration-300">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-24 top-[28%] h-[450px] w-[450px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute -left-24 top-[65%] h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <Navbar onGetStarted={handleGetStarted} />

      <main id="main-content" className="relative">
        <Hero onGetStarted={handleGetStarted} />

        <ProblemSection />

        <ProductSection />

        <AISection />

        <SelfHostingSection />

        <AIToolsSection />

        <DeveloperSection />

        <DocsPreviewSection />

        <FinalCTA onGetStarted={handleGetStarted} />
      </main>

      <Footer onGetStarted={handleGetStarted} />
    </div>
  );
}

export default function LandingPage() {
  return <LandingPageContent />;
}
