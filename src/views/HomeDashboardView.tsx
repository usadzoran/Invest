import React, { useState } from 'react';
import { User, Profile, Investment, InvestmentLevel } from '../types/database';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { db } from '../services/storage';
import {
  Wallet,
  TrendingUp,
  Coins,
  Layers,
  Users,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  Lock,
  Unlock,
} from 'lucide-react';

interface HomeDashboardViewProps {
  user: User;
  profile: Profile;
  levels: InvestmentLevel[];
  onNavigate: (tab: string) => void;
  onOpenLevelPlans: (level: InvestmentLevel) => void;
  onRefreshData: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  user,
  profile,
  levels,
  onNavigate,
  onOpenLevelPlans,
  onRefreshData,
}) => {
  const activeInvestments = db.getInvestments(user.id).filter((i) => i.status === 'active');
  const level1 = levels.find((l) => l.level_number === 1) || levels[0];
  const level2 = levels.find((l) => l.level_number === 2) || levels[1];

  const handleCycleCompleted = (returnedAmount: number) => {
    onRefreshData();
  };

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto pb-10">
      {/* Welcome & User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0c1424] to-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">حساب استثماري نشط</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            أهلاً بك، {user.first_name} {user.last_name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            كود الإحالة الخاص بك:{' '}
            <span className="font-mono text-amber-300 font-bold tracking-wider">{user.referral_code}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('wallet')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إيداع بالمحفظة</span>
          </button>
          <button
            onClick={() => onOpenLevelPlans(level1)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>استثمار جديد</span>
          </button>
        </div>
      </div>

      {/* Core Financial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b101c] border border-emerald-500/30 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">الرصيد الإجمالي</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              ${profile.total_balance.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium mt-1 inline-block">
              متاح للسحب والاستثمار
            </span>
          </div>
        </div>

        {/* Current Investment */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b101c] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">الاستثمار الحالي</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono tabular-nums">
              ${profile.current_invested.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 inline-block">
              {activeInvestments.length} خطط قيد التشغيل
            </span>
          </div>
        </div>

        {/* Profits */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b101c] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">الأرباح التراكمية</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              +${profile.total_profits.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-400/80 mt-1 inline-block">
              عائدات يومية ومكافآت
            </span>
          </div>
        </div>

        {/* Current Level & Referrals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0b101c] border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">المستوى الحالي</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white">
                Level {profile.current_level}
              </span>
              {level2?.is_unlocked && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300">
                  L2 متاح
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">الإحالات المؤهلة:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {profile.qualified_referrals_count} / 2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cycle Countdown & Level 2 Unlock Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Countdown Timer (Takes 2 cols on lg) */}
        <div className="lg:col-span-2">
          <CountdownTimer userId={user.id} onCycleCompleted={handleCycleCompleted} />
        </div>

        {/* Level 2 Progress Tracker Card */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#0e1624] to-slate-900 border border-slate-800 p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                {level2?.is_unlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                متطلبات Level 2
              </span>
              <span className="text-xs font-mono font-bold text-white tabular-nums">
                {profile.qualified_referrals_count} / 2
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">
              {level2?.is_unlocked ? '✅ تم فتح المستوى الثاني بنجاح!' : 'إحالتان مؤهلتان لفتح Level 2'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {level2?.is_unlocked
                ? 'أصبح بإمكانك الاستثمار في خطط $100 و $250 و $500 ذات العوائد الكبرى.'
                : 'يجب أن يكون لديك شخصان مسجلان عن طريق كودك وقاما بالاستثمار بأنفسهما.'}
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    profile.qualified_referrals_count >= 2
                      ? 'bg-emerald-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{
                    width: `${Math.min(100, (profile.qualified_referrals_count / 2) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            {level2?.is_unlocked ? (
              <button
                onClick={() => onOpenLevelPlans(level2)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>الانتقال إلى خطط Level 2</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('referrals')}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>متابعة ودعوة الإحالات ({profile.qualified_referrals_count}/2)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Investments Overview */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">الاستثمارات النشطة الحالية</h3>
          </div>
          <button
            onClick={() => onOpenLevelPlans(level1)}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استثمار جديد</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
            <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لا توجد استثمارات نشطة حالياً.</p>
            <button
              onClick={() => onOpenLevelPlans(level1)}
              className="mt-3 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              ابدأ أول خطة استثمار الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeInvestments.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Level {inv.level_id}
                    </span>
                    <span className="text-[10px] text-slate-400">نشط</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono tabular-nums">
                    ${inv.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-emerald-400 font-medium mt-1">
                    عائد يومي: +${inv.expected_daily_return.toFixed(2)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>تاريخ البدء:</span>
                  <span className="font-mono">
                    {new Date(inv.start_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
