'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
    else router.push('/auth/login');
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div
          className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center"
        >
          <span
            className="text-background text-xl font-normal"
            style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontStyle: 'italic' }}
          >
            L
          </span>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
