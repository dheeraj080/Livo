'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Product', href: '#product', external: false },
    { label: 'Features', href: '#features', external: false },
    { label: 'Self-Hosting', href: '#self-hosting', external: false },
    { label: 'Docs', href: '#docs', external: false },
    { label: 'GitHub', href: 'https://github.com/dheeraj080/Livo', external: true },
  ];

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/60 py-3 shadow-lg shadow-black/20'
          : 'bg-[#09090b]/60 backdrop-blur-sm py-3.5 border-b border-zinc-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo / Product Name */}
        <div className="flex items-center gap-7 lg:gap-10">
          <a
            href="#"
            id="navbar-brand-link"
            className="flex items-center gap-2.5 group transition-opacity shrink-0"
            aria-label="Livo Home"
          >
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 bg-black rounded-full" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-white">Livo</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            id="desktop-nav"
            className="hidden md:flex items-center gap-6 lg:gap-7 text-[13px] sm:text-sm text-zinc-400 font-medium"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="hover:text-white transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Dominant Primary CTA */}
        <div className="hidden md:flex items-center">
          <Link
            href="/app"
            id="navbar-get-started-btn"
            className="bg-white text-zinc-950 text-xs sm:text-[13px] px-4 py-2 rounded-full font-semibold hover:bg-zinc-200 transition-all duration-200 ease-out shadow-sm hover:shadow hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98] cursor-pointer whitespace-nowrap min-h-[36px] inline-flex items-center justify-center motion-reduce:transform-none motion-reduce:transition-none"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/80 transition-all duration-200 active:scale-[0.98]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden border-b border-zinc-800/70 bg-[#09090b]/95 backdrop-blur-xl px-5 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-zinc-400 hover:text-white px-2.5 py-2 rounded-lg hover:bg-zinc-900/60 transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800/60">
            <Link
              href="/app"
              id="mobile-nav-get-started-btn"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all duration-200 ease-out active:scale-[0.98] min-h-[44px] motion-reduce:transform-none motion-reduce:transition-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
