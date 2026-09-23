import React from 'react';
import { Database, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export const PlansSection: React.FC = () => {
  return (
    <section id="plans" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
            خطط الاستثمار
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            باقات استثمارية مرنة تناسب جميع الأهداف
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            تم تصميم الباقات الاستثمارية بنظام المستويات التصاعدي، حيث يفتح كل مستوى باقات متقدمة بعوائد يومية أعلى.
          </p>
        </div>

        {/* Dedicated Plans Container (Ready for Supabase Integration in Phase 2) */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/80 to-[#0c1220] border border-slate-800 p-8 sm:p-12 text-center max-w-4xl mx-auto overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-72 h-36 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

          {/* Integration Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium mb-6">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>مساحة مخصصة للربط المباشر مع Supabase (المرحلة القادمة)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
            هيكل الخطط جاهز للتحميل المباشر من قاعدة البيانات
          </h3>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            التزاماً بمعايير النزاهة ومنع البيانات الوهمية (No Mock Data)، سيتم تحميل مستويات الخطط، مبالغ الباقات، ونسب العوائد الحقيقية مباشرة من جداول Supabase عند ربطها في المرحلة الثانية.
          </p>

          {/* Architectural Blueprint Cards (Illustrating System Hierarchy without Fake Figures) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-right mb-8">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400">المستوى الأول</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">باقات المبتدئين</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                خطط البداية السريعة متاحة لجميع المستثمرين الجدد فور التسجيل.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-400">المستوى الثاني</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">باقات النمو المتقدم</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                عوائد مضاعفة تتطلب تفعيل شروط الإحالة والنمو.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400">المستوى الثالث</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">باقات كبار المستثمرين</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                محافظ استثمارية أكبر مع تفضيل في سرعة التحويل اليومي.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400">المستوى الرابع</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">باقات الشركاء والنخبة</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                خطط حصرية وتخصيص استثماري مباشر لكبار الشركاء.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
            <span>سيتم عرض بطاقات الخطط التفاعلية فور إضافة الجداول في المرحلة القادمة</span>
          </div>
        </div>
      </div>
    </section>
  );
};
