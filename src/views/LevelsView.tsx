import React from 'react';
import { InvestmentLevel, Profile } from '../types/database';
import { Layers, Lock, Unlock, CheckCircle2, ChevronLeft, ArrowUpRight, Users, Sparkles } from 'lucide-react';

interface LevelsViewProps {
  levels: InvestmentLevel[];
  profile: Profile;
  onOpenLevelPlans: (level: InvestmentLevel) => void;
  onNavigate: (tab: string) => void;
}

export const LevelsView: React.FC<LevelsViewProps> = ({
  levels,
  profile,
  onOpenLevelPlans,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0e1626] to-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            نظام الترقيات
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">مستويات الاستثمار</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          كل مستوى يمنحك خططاً استثمارية بنسب عوائد أعلى وسقوف استثمارية أكبر. ترقية المستويات تتم تلقائياً عند تحقيق الشروط.
        </p>
      </div>

      {/* Levels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {levels.map((lvl) => {
          const isLvl1 = lvl.level_number === 1;
          const isLvl2 = lvl.level_number === 2;
          const isUnlocked = lvl.is_unlocked;

          // For Level 2 specifically: check requirements
          const qualifiedCount = profile.qualified_referrals_count || 0;
          const reqCount = lvl.required_referrals || 2;
          const isLvl2Ready = isLvl2 && qualifiedCount >= 2;

          return (
            <div
              key={lvl.id}
              className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                isUnlocked || (isLvl2 && isLvl2Ready)
                  ? 'bg-gradient-to-b from-slate-900/95 via-[#0d1524] to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-90'
              }`}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isUnlocked || (isLvl2 && isLvl2Ready)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    L{lvl.level_number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{lvl.name}</h3>
                    <span className="text-[11px] text-slate-400">
                      نطاق الاستثمار: ${lvl.min_investment} - ${lvl.max_investment}
                    </span>
                  </div>
                </div>

                {isUnlocked || (isLvl2 && isLvl2Ready) ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متاح</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>مغلق</span>
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {lvl.description}
              </p>

              {/* Level 2 Progress Tracker */}
              {isLvl2 && (
                <div className="my-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      شرط الإحالات المستثمرة:
                    </span>
                    <span className="font-mono font-bold text-amber-400 tabular-nums">
                      {qualifiedCount} / {reqCount}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        qualifiedCount >= 2 ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, (qualifiedCount / reqCount) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {qualifiedCount >= 2
                      ? '✅ اكتمل شرط الإحالات! أصبح المستوى مفتوحاً لك الآن.'
                      : `متبقي ${Math.max(0, 2 - qualifiedCount)} إحالة مؤهلة قامت بالاستثمار لتفعيل المستوى.`}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/70">
                {isLvl1 && (
                  <button
                    onClick={() => onOpenLevelPlans(lvl)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-l from-amber-400 via-emerald-400 to-emerald-300 hover:from-amber-300 hover:to-emerald-200 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>عرض خطط الاستثمار</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {isLvl2 && (
                  <div>
                    {isUnlocked || isLvl2Ready ? (
                      <button
                        onClick={() => onOpenLevelPlans(lvl)}
                        className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>الانتقال إلى Level 2</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                          🔒 هذا المستوى غير متاح حاليًا
                        </div>
                        <button
                          onClick={() => onNavigate('referrals')}
                          className="w-full py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>دعوة الأصدقاء لتحقيق الشرط ({qualifiedCount}/2)</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!isLvl1 && !isLvl2 && (
                  <div className="py-2.5 px-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                    🔒 هذا المستوى غير متاح حاليًا
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
