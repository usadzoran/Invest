import React from 'react';
import { ArrowLeft, LogIn, Shield, Zap, Sparkles, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth: (type: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAuth }) => {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>الجيل الجديد من منصات الاستثمار الرقمي</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.2] mb-6">
            استثمر بذكاء، نمّ أصولك وحقق{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              عوائد يومية موثوقة
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-normal">
            منصة <strong className="text-white font-semibold">INVEST</strong> تمنحك إمكانية إدارة وتنمية استثماراتك بأعلى معايير الشفافية والتكنولوجيا المالية المتقدمة، مع دورات استثمارية واضحة ونظام نمو متصاعد.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>إنشاء حساب</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-base text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5 text-emerald-400" />
              <span>تسجيل الدخول</span>
            </button>
          </div>

          {/* Trust Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-3xl mx-auto text-right">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">عوائد يومية</h4>
                <p className="text-xs text-slate-400">دورات استثمار محددة بـ 24 ساعة</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">حماية وتشفير</h4>
                <p className="text-xs text-slate-400">معايير حماية وشفافية برمجية</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">مستويات نمو</h4>
                <p className="text-xs text-slate-400">ترقيات متدرجة مع توسع المحفظة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
