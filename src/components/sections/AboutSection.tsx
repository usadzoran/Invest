import React from 'react';
import { Target, Clock, Award, Layers } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      icon: Clock,
      title: 'دورات استثمارية منظمة (24 ساعة)',
      description: 'يقوم النظام على دورات استثمارية واضحة تبدأ فور تفعيل الخطة، وتُحسب الأرباح تلقائياً في نهاية كل دورة بيقين وشفافية كاملة.',
    },
    {
      icon: Layers,
      title: 'نظام المستويات المتصاعدة',
      description: 'تبدأ رحلتك من المستوى الأول الاستكشافي، ومع زيادة النشاط وشبكة الإحالة يتم فتح مستويات أعلى بميزات ونسب عوائد أكثر تفضيلاً.',
    },
    {
      icon: Target,
      title: 'بساطة العمل المالي',
      description: 'واجهة نظيفة بدون مؤشرات معقدة أو متطلبات فنية مرهقة. حدد خطتك، فعل استثمارك، وراقب نتائجك لحظة بلحظة.',
    },
    {
      icon: Award,
      title: 'أمان الأصول والبيانات',
      description: 'هيكلية تعتمد على قواعد بيانات سحابية متقدمة مع سياسات وصول صارمة لحماية حسابك ومعاملاتك.',
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#060910] border-t border-b border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
            فكرة المنصة
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
            ما هي رؤية منصة INVEST وكيف صُممت لخدمتك؟
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            تم بناء المنصة لسد الفجوة بين عالم التكنولوجيا المالية الحديثة وسهولة الاستخدام. نؤمن بأن الاستثمار الناجح يعتمد على الوضوح وسرعة التنفيذ والالتزام بالعوائد الدورية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 transition-all text-right group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
