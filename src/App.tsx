import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/storage';
import { User, Profile, InvestmentLevel } from './types/database';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { LandingView } from './views/LandingView';
import { HomeDashboardView } from './views/HomeDashboardView';
import { LevelsView } from './views/LevelsView';
import { ReferralsView } from './views/ReferralsView';
import { WalletView } from './views/WalletView';
import { OperationsView } from './views/OperationsView';
import { ProfileView } from './views/ProfileView';
import { AuthModal } from './views/AuthModal';
import { InvestmentModal } from './views/InvestmentModal';
import { AdminSecureView } from './views/AdminSecureView';
import { Logo } from './components/common/Logo';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [profile, setProfile] = useState<Profile | null>(() => {
    const u = db.getCurrentUser();
    return u ? db.getUserProfile(u.id) : null;
  });
  const [levels, setLevels] = useState<InvestmentLevel[]>(() => db.getLevels());
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Hidden admin routing
  const [route, setRoute] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('secure-admin') || hash.includes('secure-admin')) {
      return 'secure-admin';
    }
    return 'main';
  });

  // Modals state
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [investmentModalOpen, setInvestmentModalOpen] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<InvestmentLevel | null>(null);

  // Sync state from database
  const refreshData = useCallback(() => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const prof = db.getUserProfile(user.id);
      setProfile(prof);
    } else {
      setProfile(null);
    }
    setLevels(db.getLevels());
  }, []);

  useEffect(() => {
    refreshData();

    // Subscribe to database changes
    const unsubscribe = db.subscribe(() => {
      refreshData();
    });

    // Listen to hash / URL changes for hidden admin route
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('secure-admin') || hash.includes('secure-admin')) {
        setRoute('secure-admin');
      } else {
        setRoute('main');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Check if URL has ?ref=... parameter
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const user = db.getCurrentUser();
    if (ref && !user) {
      setAuthMode('register');
      setAuthOpen(true);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [refreshData]);

  // If in hidden admin route, display secure admin view
  if (route === 'secure-admin') {
    return (
      <AdminSecureView
        onExit={() => {
          const basePath = window.location.pathname.toLowerCase().includes('/invest')
            ? '/Invest/'
            : window.location.pathname.replace(/\/secure-admin\/?$/i, '') || '/';
          if (window.location.hash) {
            window.location.hash = '';
          } else {
            window.history.pushState({}, '', basePath);
          }
          setRoute('main');
          setCurrentTab('home');
        }}
      />
    );
  }

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = async () => {
    await db.logout();
    refreshData();
    setCurrentTab('landing');
  };

  const handleAuthSuccess = () => {
    refreshData();
    setCurrentTab('home');
  };

  const handleOpenLevelPlans = (lvl: InvestmentLevel) => {
    setSelectedLevel(lvl);
    setInvestmentModalOpen(true);
  };

  // Determine active view
  const renderCurrentView = () => {
    if (!currentUser) {
      return <LandingView onOpenAuth={handleOpenAuth} />;
    }

    if (!profile) {
      return (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>جاري مزامنة بيانات الحساب...</span>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomeDashboardView
            user={currentUser}
            profile={profile}
            levels={levels}
            onNavigate={setCurrentTab}
            onOpenLevelPlans={handleOpenLevelPlans}
            onRefreshData={refreshData}
          />
        );
      case 'levels':
        return (
          <LevelsView
            levels={levels}
            profile={profile}
            onOpenLevelPlans={handleOpenLevelPlans}
            onNavigate={setCurrentTab}
          />
        );
      case 'wallet':
        return (
          <WalletView
            user={currentUser}
            profile={profile}
            onRefreshData={refreshData}
          />
        );
      case 'referrals':
        return (
          <ReferralsView
            user={currentUser}
            profile={profile}
            levels={levels}
            onOpenLevelPlans={handleOpenLevelPlans}
            onRefreshData={refreshData}
          />
        );
      case 'operations':
        return <OperationsView user={currentUser} />;
      case 'profile':
        return (
          <ProfileView
            user={currentUser}
            profile={profile}
            levels={levels}
            onNavigate={setCurrentTab}
            onLogout={handleLogout}
            onRefreshData={refreshData}
          />
        );
      default:
        return (
          <HomeDashboardView
            user={currentUser}
            profile={profile}
            levels={levels}
            onNavigate={setCurrentTab}
            onOpenLevelPlans={handleOpenLevelPlans}
            onRefreshData={refreshData}
          />
        );
    }
  };

  const level2 = levels.find((l) => l.level_number === 2);
  const isLvl2Unlocked = level2?.is_unlocked || (profile?.qualified_referrals_count || 0) >= 2;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        profile={profile}
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-12">
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation (only when logged in) */}
      {currentUser && (
        <BottomNav
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          level2Unlocked={isLvl2Unlocked}
        />
      )}

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060910] py-6 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showSubtitle={false} />
            <span className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} استثمر واربح. جميع الحقوق محفوظة.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">INVEST • GROW • PROFIT</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              الشروط والأحكام
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              سياسة الخصوصية
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Investment Plans & Confirmation Modal */}
      {selectedLevel && profile && currentUser && (
        <InvestmentModal
          isOpen={investmentModalOpen}
          level={selectedLevel}
          plans={db.getPlansForLevel(selectedLevel.level_number)}
          userBalance={profile.total_balance}
          userId={currentUser.id}
          onClose={() => {
            setInvestmentModalOpen(false);
            setSelectedLevel(null);
          }}
          onSuccess={() => {
            refreshData();
          }}
        />
      )}
    </div>
  );
}
