import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-black',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Financial ascending arrow & vault emblem */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-950 via-slate-900 to-amber-950/80 border border-emerald-500/30 shadow-md shadow-emerald-950/40 shrink-0 overflow-hidden`}
      >
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_70%)]" />

        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        >
          {/* Base bar charts */}
          <rect x="5" y="19" width="4" height="8" rx="1" fill="#10B981" fillOpacity="0.4" />
          <rect x="11" y="15" width="4" height="12" rx="1" fill="#10B981" fillOpacity="0.7" />
          <rect x="17" y="11" width="4" height="16" rx="1" fill="#F59E0B" fillOpacity="0.85" />
          <rect x="23" y="7" width="4" height="20" rx="1" fill="#34D399" />
          
          {/* Dynamic rising arrow curve */}
          <path
            d="M5 21L12 14L18 17L27 6"
            stroke="url(#arrow_gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow head */}
          <path
            d="M21 6H27V12"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="arrow_gradient" x1="5" y1="21" x2="27" y2="6" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.6" stopColor="#10B981" />
              <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`${titleSizes[size]} tracking-tight leading-none bg-gradient-to-l from-amber-300 via-emerald-400 to-emerald-200 bg-clip-text text-transparent`}
        >
          استثمر واربح
        </span>
        {showSubtitle && (
          <span className="text-[10px] tracking-[0.2em] font-mono font-medium text-emerald-400/80 mt-1 uppercase">
            INVEST • GROW • PROFIT
          </span>
        )}
      </div>
    </div>
  );
};
