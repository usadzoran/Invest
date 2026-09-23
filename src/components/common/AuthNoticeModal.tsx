import React from 'react';
import { X, ShieldCheck, Database, ArrowLeft } from 'lucide-react';

interface AuthNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'login' | 'register';
}

export const AuthNoticeModal: React.FC<AuthNoticeModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-[#0c1220] border border-slate-800 shadow-2xl text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {title}
        </h3>

        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          {type === 'register' 
            ? 'نظام إنشاء الحسابات وكلمات المرور المشفرة مخصص للربط المباشر مع Supabase Authentication في المرحلة التالية.'
            : 'نظام تسجيل الدخول الآمن وجلسات المستخدمين مخصص للربط المباشر مع Supabase Auth في المرحلة التالية.'}
        </p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-6">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <Database className="w-4 h-4" />
            <span>المرحلة الأولى: واجهة الموقع (Website UI)</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            حرصاً على أعلى معايير الأمان، لا نستخدم أي بيانات وهمية أو تخزين محلي (Mock Data). سيتم تفعيل الحسابات بقاعدة بيانات نظيفة ومحمية بـ RLS فور اكتمال ربط Supabase.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>العودة لتصفح الموقع</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
