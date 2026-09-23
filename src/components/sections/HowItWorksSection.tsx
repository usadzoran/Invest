import React from 'react';
import { UserCheck, CreditCard, PlayCircle, Wallet } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: UserCheck,
      title: 'إنشاء وتفعيل الحساب',
      description: 'سجّل حسابك الجديد في دقائق معدودة، وتحقق من بياناتك لتصبح جاهزاً للبدء بأمان.',
    },
    {
      number: '02',
      icon: CreditCard,
      title: 'اختيار خطة الاستثمار',
      description: 'استعرض باقات الاستثمار المتاحة في مستواك الحالي واختر الباقة التي تتناسب مع أهدافك المالية.',
    },
    {
      number: '03',
      icon: PlayCircle,
      title: 'انطلاق دورة الاستثمار (24 ساعة)',
      description: 'يبدأ عداد دورة الاستثمار الذاتي لمدة 24 ساعة، مع حساب دقيق ومباشر للعائد المتوقع.',
    },
    {
      number: '04',
      icon: Wallet,
      title: 'إيداع الأرباح وإمكانية السحب',
      description: 'عند انتهاء الدورة، تُضاف أرباحك الصافية فوراً إلى رصيدك لتتمكن من إعادة الاستثمار أو السحب.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-[#060910] border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
            خطوات بسيطة
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            كيف يعمل موقع INVEST؟
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            آلية عمل انسيابية وواضحة تمكنك من بدء وتتبع استثماراتك في 4 خطوات متسلسلة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 transition-all text-right group"
              >
                {/* Step Number Watermark */}
                <div className="absolute top-4 left-4 font-mono font-black text-2xl text-slate-800 group-hover:text-emerald-500/20 transition-colors select-none">
                  {step.number}
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
