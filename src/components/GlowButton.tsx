import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  glowColor?: 'blue' | 'emerald' | 'violet' | 'orange' | 'amber' | 'zinc';
}

export function GlowButton({ children, className, variant = 'primary', glowColor = 'amber', ...props }: GlowButtonProps) {
  const variants = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/10",
    outline: "bg-transparent border border-white/20 text-zinc-100 hover:bg-white/5",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5",
  };

  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-full font-medium tracking-widest uppercase text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none px-6 py-3 flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
