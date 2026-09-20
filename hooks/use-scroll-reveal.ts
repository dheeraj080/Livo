'use client';

import { useState, useEffect, useRef } from 'react';
import { useHydrated, usePrefersReducedMotion } from '@/hooks/use-hydrated';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -60px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<T | null>(null);
  const [internalRevealed, setInternalRevealed] = useState(false);
  const isMounted = useHydrated();
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const node = ref.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      requestAnimationFrame(() => setInternalRevealed(true));
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    // Check if element is already within viewport
    const rect = node.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < windowHeight && rect.bottom > 0) {
      if (delay > 0) {
        timer = setTimeout(() => setInternalRevealed(true), delay);
      } else {
        requestAnimationFrame(() => setInternalRevealed(true));
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timer = setTimeout(() => setInternalRevealed(true), delay);
          } else {
            setInternalRevealed(true);
          }
          if (triggerOnce && node) {
            observer.unobserve(node);
            observer.disconnect();
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, prefersReduced]);

  const isRevealed = !isMounted || prefersReduced || internalRevealed;

  return { ref, isRevealed };
}
