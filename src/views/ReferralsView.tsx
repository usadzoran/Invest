import React, { useState } from 'react';
import { User, Profile, Referral, InvestmentLevel } from '../types/database';
import { db } from '../services/storage';
import {
  Users,
  Copy,
  Check,
  Share2,
  Send,
  MessageCircle,
  Award,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

interface ReferralsViewProps {
  user: User;
  profile: Profile;
  levels: InvestmentLevel[];
  onOpenLevelPlans: (level: InvestmentLevel) => void;
  onRefreshData: () => void;
}

export const ReferralsView: React.FC<ReferralsViewProps> = ({
  user,
  profile,
  levels,
  onOpenLevelPlans,
  onRefreshData,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const referrals = db.getReferrals(user.id);
  const totalCount = referrals.length;
  const qualifiedCount = referrals.filter((r) => r.status === 'qualified').length;
  const level2 = levels.find((l) => l.level_number === 2) || levels[1];
  const isLevel2Unlocked = level2?.is_unlocked || qualifiedCount >= 2;

  // Build referral link
  const currentOrigin = window.location.origin;
  const referralLink = `${currentOrigin}/?ref=${user.referral_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `انضم إلي في منصة «استثمر واربح» وابدأ استثمارك اليومي بعوائد مميزة! سجّل عبر الرابط:\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `انضم إلي في منصة «استثمر واربح»! استخدم كود الإحالة ${user.referral_code} أو اضغط الرابط:`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'استثمر واربح | INVEST • GROW • PROFIT',
          text: `انضم إلى منصة «استثمر واربح» باستخدام كود الإحالة: ${user.referral_code}`,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  // Simulate an invitee registering and investing (demo tester)
  const handleSimulateReferral = (invested: boolean) => {
    setSimulating(true);
    setTimeout(() => {
      db.simulateAddReferral(user.id, invested);
      onRefreshData();
      setSimulating(false);
    }, 400);
  };

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            برنامج الإحالات
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">نظام الإحالة والترقية</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          شارك كودك الخاص مع أصدقائك. عند قيام إحالتين بالاستثمار الفعلي في المنصة، سيتم فتح Level 2 تلقائياً لحسابك!
        </p>
      </div>

      {/* Level 2 Unlock Milestone Progress Card */}
      <div
        className={`rounded-3xl border p-6 transition-all ${
          isLevel2Unlocked
            ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/50 shadow-xl'
            : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/30 shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isLevel2Unlocked
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isLevel2Unlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">هدف الترقية إلى Level 2</h3>
                {isLevel2Unlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ✅ متاح
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                    قيد التقدم
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isLevel2Unlocked
                  ? 'تهانينا! حققت شرط الإحالتين المؤهلتين (2/2). خطط Level 2 جاهزة ومتاحة لك.'
                  : `أنت بحاجة إلى ${Math.max(0, 2 - qualifiedCount)} إحالة إضافية مسجلة ومستثمرة لفتح المستوى الثاني.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right font-mono">
              <span className="text-2xl font-black text-white tabular-nums">
                {qualifiedCount} / 2
              </span>
              <span className="block text-[10px] text-slate-400">إحالات مؤهلة</span>
            </div>

            {isLevel2Unlocked && (
              <button
                onClick={() => onOpenLevelPlans(level2)}
                className="py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-1.5"
              >
                <span>الانتقال إلى Level 2</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isLevel2Unlocked
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, (qualifiedCount / 2) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            <span>0 إحالات</span>
            <span>1 إحالة مؤهلة</span>
            <span className="font-bold text-white">2 إحالات مؤهلة (فتح Level 2)</span>
          </div>
        </div>
      </div>

      {/* Referral Code & Sharing Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Code & Link Box */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">كود ورابط الإحالة الشخصي</h4>

            {/* Referral Code */}
            <div className="mb-4">
              <label className="block text-[11px] text-slate-400 mb-1">Referral Code الخاص بك:</label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-lg text-amber-400 tracking-widest select-all"
                  dir="ltr"
                >
                  {user.referral_code}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title="نسخ الكود"
                >
                  {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">رابط الإحالة المباشر:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  dir="ltr"
                  value={referralLink}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ رابط الإحالة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="block text-[11px] text-slate-400 mb-2">مشاركة سريعة عبر الهاتف:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </button>
              <button
                onClick={handleShareTelegram}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-950/70 hover:bg-sky-900/70 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>تيليجرام</span>
              </button>
              <button
                onClick={handleNativeShare}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="مشاركة أخرى"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Simulator Box */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">إحصائيات الإحالة</h4>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400">إجمالي المسجلين</span>
                <div className="text-2xl font-black text-white font-mono tabular-nums mt-0.5">
                  {totalCount}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
                <span className="text-[11px] text-emerald-400">الإحالات المؤهلة</span>
                <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-0.5">
                  {qualifiedCount}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              💡 <span className="text-slate-200 font-medium">ملاحظة تنظيمية:</span> لا تحتسب الإحالة كمؤهلة إلا بعد تحقق حالة الاستثمار الخاصة بالمستخدم المُحال إليه.
            </div>
          </div>

          {/* Testing Simulator Helper */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <span className="block text-[11px] font-semibold text-amber-300 mb-2">
              أدوات التجربة السريعة (للمعاينة):
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled={simulating}
                onClick={() => handleSimulateReferral(true)}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>محاكاة إحالة مؤهلة (استثمرت)</span>
              </button>
              <button
                disabled={simulating}
                onClick={() => handleSimulateReferral(false)}
                className="py-2 px-3 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>مسجل فقط</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Referrals List Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">قائمة الأشخاص المسجلين بكودك</h3>
          <span className="text-xs text-slate-400">{referrals.length} إحالة</span>
        </div>

        {referrals.length === 0 ? (
          <div className="py-10 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">لم يسجل أي شخص عبر كودك حتى الآن.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              شارك رابط الإحالة مع أصدقائك للبدء في تحقيق شرط فتح Level 2.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {referrals.map((ref) => {
              const isQualified = ref.status === 'qualified';
              return (
                <div
                  key={ref.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isQualified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ref.referred_name?.[0] || 'U'}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{ref.referred_name}</h5>
                      <span className="text-[10px] text-slate-400">
                        تاريخ التسجيل:{' '}
                        {new Date(ref.registered_at).toLocaleDateString('ar-SA', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    {isQualified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مستثمر / مؤهل</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>مسجل فقط</span>
                      </span>
                    )}
                    {isQualified && ref.invested_amount > 0 && (
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                        استثمر: ${ref.invested_amount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
