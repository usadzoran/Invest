import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { PlansSection } from './components/sections/PlansSection';
import { HowItWorksSection } from './components/sections/HowItWorksSection';
import { Footer } from './components/layout/Footer';
import { AuthNoticeModal } from './components/common/AuthNoticeModal';

export default function App() {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: 'login' | 'register';
    title: string;
  }>({
    isOpen: false,
    type: 'login',
    title: '',
  });

  const handleOpenAuth = (type: 'login' | 'register') => {
    setAuthModal({
      isOpen: true,
      type,
      title: type === 'register' ? 'إنشاء حساب جديد' : 'تسجيل الدخول إلى حسابك',
    });
  };

  const handleCloseAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header & Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Website Sections */}
      <main className="flex-1">
        <HeroSection onOpenAuth={handleOpenAuth} />
        <AboutSection />
        <PlansSection />
        <HowItWorksSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal for Auth Notice (Phase 1 Status) */}
      <AuthNoticeModal
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        title={authModal.title}
        type={authModal.type}
      />
    </div>
  );
}
