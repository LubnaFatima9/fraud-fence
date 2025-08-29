
"use client";

import { useState, useEffect } from 'react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Simulate loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-700 ease-in-out',
        'bg-gradient-to-br from-magenta-900 via-purple-900 to-blue-900', // Matches dark theme
        loading ? 'opacity-100' : 'opacity-0 translate-y-[-100vh]'
      )}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <Logo className="h-24 w-24 animate-pulse-slow" />
        <h1 className="font-headline text-4xl font-bold text-white animate-logo-glow">
          FraudFence
        </h1>
      </div>
    </div>
  );
}
