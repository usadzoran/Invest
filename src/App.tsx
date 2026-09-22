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
import { AdminPreviewModal } from './views/AdminPreviewModal';
import { Logo } from './components/common/Logo';
import { ShieldCheck, Database } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [levels, setLevels] = useState<InvestmentLevel[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [investmentModalOpen, setInvestmentModalOpen] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<InvestmentLevel | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);

  // Sync state from storage
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

    // Check if URL has ?ref=... parameter
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const user = db.getCurrentUser();
    if (ref && !user) {
      setAuthMode('register');
      setAuthOpen(true);
    }
  }, [refreshData]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = () => {
    db.logout();
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
          جاري تحميل بيانات الحساب...
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

      {/* Footer */}
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
            {/* Discreet Admin Architecture Inspector Button */}
            <button
              onClick={() => setAdminModalOpen(true)}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
              title="معاينة بنية لوحة الإدارة وقواعد البيانات لـ Supabase"
            >
              <Database className="w-3.5 h-3.5" />
              <span>هيكل الإدارة (Admin DB)</span>
            </button>
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

      {/* Admin Architecture Preview Modal */}
      <AdminPreviewModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onRefreshData={refreshData}
      />
    </div>
  );
}
