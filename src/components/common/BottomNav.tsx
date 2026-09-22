import React from 'react';
import { Home, Layers, Wallet, Users, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  level2Unlocked?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  level2Unlocked = false,
}) => {
  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'levels', label: 'المستويات', icon: Layers, badge: level2Unlocked },
    { id: 'wallet', label: 'المحفظة', icon: Wallet },
    { id: 'referrals', label: 'الإحالات', icon: Users },
    { id: 'profile', label: 'حسابي', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#080c14]/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-all select-none cursor-pointer ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active top subtle bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-b-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
