import React from 'react';
import { Logo } from './Logo';
import { User, Profile } from '../../types/database';
import { Wallet, User as UserIcon, LogOut, ArrowRightLeft, ShieldCheck, Database } from 'lucide-react';
import { getSupabaseConfig } from '../../services/supabase';

interface NavbarProps {
  currentUser: User | null;
  profile: Profile | null;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenSupabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  profile,
  currentTab,
  onNavigate,
  onOpenAuth,
  onLogout,
  onOpenSupabase,
}) => {
  const isSupabaseConfigured = getSupabaseConfig().isConfigured;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single element brand mark */}
        <button
          onClick={() => onNavigate(currentUser ? 'home' : 'landing')}
          className="cursor-pointer text-right transition-opacity hover:opacity-95"
        >
          <Logo size="sm" showSubtitle={false} />
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        {currentUser ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors cursor-pointer py-1 ${
                currentTab === 'home'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => onNavigate('levels')}
              className={`transition-colors cursor-pointer py-1 ${
                currentTab === 'levels'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              مستويات الاستثمار
            </button>
            <button
              onClick={() => onNavigate('wallet')}
              className={`transition-colors cursor-pointer py-1 ${
                currentTab === 'wallet'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              المحفظة
            </button>
            <button
              onClick={() => onNavigate('referrals')}
              className={`transition-colors cursor-pointer py-1 ${
                currentTab === 'referrals'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              الإحالات
            </button>
            <button
              onClick={() => onNavigate('operations')}
              className={`transition-colors cursor-pointer py-1 ${
                currentTab === 'operations'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              سجل العمليات
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`transition-colors cursor-pointer py-1 ${
                currentTab === 'profile'
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'hover:text-white'
              }`}
            >
              الملف الشخصي
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-emerald-400 transition-colors">
              عن المنصة
            </a>
            <a href="#levels-preview" className="hover:text-emerald-400 transition-colors">
              المستويات
            </a>
            <a href="#referrals-info" className="hover:text-emerald-400 transition-colors">
              نظام الإحالة
            </a>
            <a href="#security" className="hover:text-emerald-400 transition-colors">
              الأمان والضمان
            </a>
          </nav>
        )}

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Status / Settings Button */}
          <button
            onClick={onOpenSupabase}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-emerald-500/40'
            }`}
            title="إعدادات واتصال قاعدة بيانات Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Supabase</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick balance pill */}
              <button
                onClick={() => onNavigate('wallet')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors text-right cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-emerald-300 tabular-nums" dir="ltr">
                  ${(profile?.total_balance || 0).toFixed(2)}
                </span>
              </button>

              {/* User profile dropdown / logout */}
              <button
                onClick={() => onNavigate('profile')}
                className="hidden sm:flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.first_name?.[0] || 'U'}
                </div>
                <span className="truncate max-w-[90px]">{currentUser.first_name}</span>
              </button>

              <button
                onClick={onLogout}
                title="تسجيل الخروج"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                تسجيل حساب جديد
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
