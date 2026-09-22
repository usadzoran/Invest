import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import {
  TrendingUp,
  Shield,
  Zap,
  Users,
  Lock,
  ArrowUpRight,
  ChevronLeft,
  DollarSign,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
  // Interactive investment simulator
  const [calcAmount, setCalcAmount] = useState<number>(25);

  const calculateReturn = (amount: number) => {
    // 20% return for level 1
    return (amount * 0.2).toFixed(1);
  };

  return (
    <div className="relative overflow-hidden text-right pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-20 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center mb-6">
          <div className="scale-125 sm:scale-150 mb-6">
            <Logo size="lg" showSubtitle={true} />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
            طريقك الذكي نحو{' '}
            <span className="bg-gradient-to-l from-amber-300 via-emerald-400 to-emerald-200 bg-clip-text text-transparent">
              عوائد يومية مستدامة
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            «ابدأ استثمارك بالمبلغ الذي يناسبك، واختر المستوى المناسب لك، وتابع استثمارك وعوائدك من خلال حسابك الشخصي.»
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-xs sm:max-w-md mx-auto">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base text-slate-950 bg-gradient-to-l from-amber-400 via-emerald-400 to-emerald-300 hover:from-amber-300 hover:to-emerald-200 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>تسجيل حساب جديد</span>
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl font-semibold text-sm sm:text-base text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-800/60">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              $5
            </span>
            <p className="text-[11px] text-slate-400 mt-1">الحد الأدنى للبدء</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono tabular-nums">
              24h
            </span>
            <p className="text-[11px] text-slate-400 mt-1">دورة احتساب الأرباح</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              2 إحالات
            </span>
            <p className="text-[11px] text-slate-400 mt-1">لفتح المستوى الثاني</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-xl sm:text-2xl font-bold text-slate-200 font-mono tabular-nums">
              USDT / BTC
            </span>
            <p className="text-[11px] text-slate-400 mt-1">سحب وإيداع فوري</p>
          </div>
        </div>
      </section>

      {/* Live Investment Return Calculator */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto my-12">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0b111d] border border-emerald-500/20 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                حاسبة الأرباح التقديرية
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                احسب عوائدك اليومية لـ Level 1
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              عائد يومي 20%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-2">
                  <span>مبلغ الاستثمار المحدد:</span>
                  <span className="font-mono text-emerald-400 font-bold text-base tabular-nums">
                    ${calcAmount}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                {[5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcAmount(amt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      calcAmount === amt
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-center">
              <span className="text-xs text-slate-400">العائد اليومي المتوقع كل 24 ساعة:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
                  +${calculateReturn(calcAmount)}
                </span>
                <span className="text-xs text-slate-400">/ اليوم</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                يتم احتساب العائد تلقائياً في حسابك مع انتهاء عداد الدورة اليومية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Preview Section */}
      <section id="levels-preview" className="px-4 sm:px-6 max-w-5xl mx-auto my-16">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            نظام الترقية التدريجي
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            مستويات استثمارية تناسب نمو محفظتك
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            يبدأ كل مستخدم في المستوى الأول، ويتيح نظام الإحالات فتح المستويات المتقدمة ذات العوائد الأكبر.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level 1 Card */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-[#0e1624] border border-emerald-500/40 p-5 shadow-lg flex flex-col justify-between">
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              مفتوح للجميع
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400">Level 1</span>
              <h4 className="text-base font-bold text-white mt-1">مستوى البداية</h4>
              <p className="text-xs text-slate-400 mt-2">
                خطط تبدأ من $5 وتصل إلى $50 مع عوائد يومية سريعة.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div>الخطط: $5, $10, $25, $50</div>
                <div>الشرط: متاح فوراً</div>
              </div>
            </div>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full mt-5 py-2 px-3 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
            >
              ابدأ الآن
            </button>
          </div>

          {/* Level 2 Card */}
          <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col justify-between">
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> يتطلب 2 إحالات
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400">Level 2</span>
              <h4 className="text-base font-bold text-white mt-1">المستوى المتقدم</h4>
              <p className="text-xs text-slate-400 mt-2">
                خطط تبدأ من $100، $250، $500 بعوائد يومية مضاعفة.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-1.5 text-slate-400">
                <div>الخطط: $100 - $500 ومبالغ مخصصة</div>
                <div>الشرط: شخصان مستثمران عبر كودك</div>
              </div>
            </div>
            <div className="mt-5 py-2 px-3 rounded-xl text-xs font-medium text-slate-500 bg-slate-950/60 text-center">
              🔒 يفتح بعد تحقيق الشرط
            </div>
          </div>

          {/* Level 3 Card */}
          <div className="relative rounded-2xl bg-slate-900/30 border border-slate-800/60 p-5 flex flex-col justify-between opacity-80">
            <div className="absolute top-3 left-3 text-slate-500 text-[10px]">
              <Lock className="w-3 h-3" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400">Level 3</span>
              <h4 className="text-base font-bold text-white mt-1">كبار المستثمرين</h4>
              <p className="text-xs text-slate-400 mt-2">
                استثمارات تبدأ من $1,000 بعوائد مميزة ونسب تفضيلية.
              </p>
            </div>
            <div className="mt-5 py-2 text-xs text-slate-500 text-center">
              🔒 هذا المستوى غير متاح حاليًا
            </div>
          </div>

          {/* Level 4 Card */}
          <div className="relative rounded-2xl bg-slate-900/30 border border-slate-800/60 p-5 flex flex-col justify-between opacity-80">
            <div className="absolute top-3 left-3 text-slate-500 text-[10px]">
              <Lock className="w-3 h-3" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-400">Level 4</span>
              <h4 className="text-base font-bold text-white mt-1">الشركاء النخبة</h4>
              <p className="text-xs text-slate-400 mt-2">
                باقات مخصصة تبدأ من $10,000 للمحافظ الكبرى.
              </p>
            </div>
            <div className="mt-5 py-2 text-xs text-slate-500 text-center">
              🔒 هذا المستوى غير متاح حاليًا
            </div>
          </div>
        </div>
      </section>

      {/* Referrals Mechanism Section */}
      <section id="referrals-info" className="px-4 sm:px-6 max-w-4xl mx-auto my-16">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                نظام الإحالة الحقيقي والمؤهل
              </h3>
              <p className="text-xs text-slate-400">
                اكسب عمولات وافتح المستويات العليا بمجرد دعوة شريكين مستثمرين
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">
                1
              </div>
              <h5 className="text-xs font-bold text-white">شارك رابطك أو كودك</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                لكل حساب كود ورابط إحالة خاص يمكن مشاركته عبر واتساب وتيليجرام بنقرة واحدة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">
                2
              </div>
              <h5 className="text-xs font-bold text-white">تأهيل الإحالة بالاستثمار</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                تُحتسب الإحالة كمؤهلة فور قيام صديقك بأول استثمار له في المنصة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center mb-2">
                3
              </div>
              <h5 className="text-xs font-bold text-white">فتح المستوى الثاني فوراً</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                عند وصولك إلى 2/2 إحالات مؤهلة، يتحول Level 2 إلى متاح وتفتح لك الخطط الكبرى!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Guarantees */}
      <section id="security" className="px-4 sm:px-6 max-w-4xl mx-auto my-12 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">حسابات مشفرة وآمنة</h4>
            <p className="text-xs text-slate-400 mt-1">
              حماية تامة لكافة بيانات الحساب والعمليات المالية.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">دورة يومية دقيقة</h4>
            <p className="text-xs text-slate-400 mt-1">
              عداد تنازلي ثابت لا ينقطع يضمن وصول أرباحك في موعدها.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">سحب سريع للمحافظ</h4>
            <p className="text-xs text-slate-400 mt-1">
              دعم العملات الرقمية المستقرة USDT وعملات BTC و ETH.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto mt-16 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/60 border border-emerald-500/30 p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white">جاهز لبدء استثمارك اليوم؟</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
            انضم إلى منصة «استثمر واربح»، اختر خطتك الأولى، وراقب نمو محفظتك يوماً بعد يوم.
          </p>
          <button
            onClick={() => onOpenAuth('register')}
            className="mt-6 py-3 px-8 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-l from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
          >
            سجل حسابك مجاناً الآن
          </button>
        </div>
      </section>
    </div>
  );
};
