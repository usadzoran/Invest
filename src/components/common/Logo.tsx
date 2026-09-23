import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <a href="#home" className={`flex items-center gap-2.5 group transition-transform active:scale-95 ${className}`}>
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 group-hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
        <TrendingUp className={`${iconSizes[size]} text-emerald-400 group-hover:scale-110 transition-transform`} />
      </div>
      <div className="flex flex-col text-right">
        <span className={`font-black tracking-wider ${textSizes[size]} bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent font-mono`}>
          INVEST
        </span>
      </div>
    </a>
  );
};
