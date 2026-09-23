import React from 'react';
import { Logo } from '../common/Logo';
import { Shield, Lock, FileText, ChevronLeft } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#05070d] border-t border-slate-800/80 pt-16 pb-12 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Overview */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo size="md" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
              منصة <strong className="text-slate-200">INVEST</strong> هي منصة تكنولوجيا مالية متطورة تهدف إلى تقديم حلول استثمارية يومية بآليات واضحة ونظام نمو تصاعدي مدعوم بأعلى معايير الحماية الرقمية.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>تشفير بيانات آمن</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>حماية سياسات RLS</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              <span>أقسام الموقع</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#home" className="hover:text-emerald-400 transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-emerald-400 transition-colors">
                  خطط الاستثمار
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  كيفية العمل
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-400 transition-colors">
                  فكرة المنصة
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Guidelines */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>الشفافية والأمان</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <span className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                  شروط الاستخدام
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                  سياسة الخصوصية
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                  إخلاء المسؤولية المالية
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                  قواعد المستويات
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Risk Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 mb-8 text-xs text-slate-400 leading-relaxed">
          <p>
            <strong className="text-slate-300 font-semibold">تنويه المخاطر:</strong> تتضمن الأنشطة الاستثمارية والأصول الرقمية مستويات متفاوتة من المخاطر. ينبغي على المستثمر اتخاذ قراراته بما يتوافق مع قدرته المالية وأهدافه الاستثمارية المستقلة.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            جميع الحقوق محفوظة © {currentYear} <strong className="text-slate-300">INVEST</strong>.
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            RESPONSIVE WEB PLATFORM • PHASE 1
          </div>
        </div>
      </div>
    </footer>
  );
};
