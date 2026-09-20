'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHydrated, usePrefersReducedMotion } from '@/hooks/use-hydrated';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  className?: string;
  id?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  distance = 18,
  duration = 600,
  className = '',
  id,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isMounted = useHydrated();
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const node = ref.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      requestAnimationFrame(() => setIsRevealed(true));
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const rect = node.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    // If element is already in the viewport on mount
    if (rect.top < windowHeight * 0.95 && rect.bottom > 0) {
      if (delay > 0) {
        timer = setTimeout(() => setIsRevealed(true), delay);
      } else {
        requestAnimationFrame(() => setIsRevealed(true));
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timer = setTimeout(() => setIsRevealed(true), delay);
          } else {
            setIsRevealed(true);
          }
          if (node) {
            observer.unobserve(node);
            observer.disconnect();
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    observer.observe(node);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [delay, prefersReduced]);

  // If not mounted yet (SSR) or prefers reduced motion, render in revealed state
  const revealed = !isMounted || prefersReduced || isRevealed;

  return (
    <div
      ref={ref}
      id={id}
      className={`${className} ${
        revealed
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-[18px]'
      } transition-all ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        willChange: revealed ? 'auto' : 'opacity, transform',
        transform: revealed ? 'translateY(0)' : `translateY(${distance}px)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
