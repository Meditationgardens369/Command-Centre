import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'emerald' | 'violet' | 'orange' | 'amber' | 'zinc';
}

export function GlassPanel({ children, className, glowColor = 'zinc' }: GlassPanelProps) {
  const glowStyles = {
    blue: 'border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    emerald: 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    violet: 'border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]',
    orange: 'border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]',
    amber: 'border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    zinc: 'border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-zinc-900/40 backdrop-blur-2xl transition-all duration-300",
      glowStyles[glowColor],
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}
