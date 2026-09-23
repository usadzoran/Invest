import React, { useState, useEffect } from 'react';
import { db, supabase, getSupabase } from '../services/storage';
import { Logo } from '../components/common/Logo';
import {
  ShieldCheck,
  Users,
  Layers,
  ArrowRightLeft,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Wallet,
  Search,
} from 'lucide-react';

interface AdminSecureViewProps {
  onExit: () => void;
}

export const AdminSecureView: React.FC<AdminSecureViewProps> = ({ onExit }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'operations' | 'levels'>('overview');
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Check admin status on load
  const verifyAdmin = async () => {
    setCheckingAuth(true);
    const hasAdmin = await db.checkIsAdmin();
    setIsAdmin(hasAdmin);
    setCheckingAuth(false);
    if (hasAdmin) {
      loadAdminData();
    }
  };

  useEffect(() => {
    verifyAdmin();
  }, []);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [profs, txs, invs] = await Promise.all([
        db.getAllProfilesForAdmin(),
        db.getAllTransactionsForAdmin(),
        db.getAllInvestmentsForAdmin(),
      ]);
      setProfiles(profs);
      setTransactions(txs);
      setInvestments(invs);
      setLevels(db.getLevels());
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await db.loginUser(adminEmail, adminPassword);
      if (!res.success) {
        setLoginError(res.error || 'فشل تسجيل الدخول للإدارة.');
        setLoginLoading(false);
        return;
      }

      const hasAdminPermission = await db.checkIsAdmin();
      if (!hasAdminPermission) {
        setLoginError('تم رفض الوصول: هذا الحساب مسجل لكنه لا يمتلك صلاحيات المشرف أو الإدارة.');
        setLoginLoading(false);
        await db.logout();
        return;
      }

      setIsAdmin(true);
      await loadAdminData();
    } catch (e: any) {
      setLoginError(e?.message || 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggleLevel = async (levelNumber: number, currentUnlocked: boolean) => {
    const success = await db.toggleLevelUnlockForAdmin(levelNumber, !currentUnlocked);
    if (success) {
      setActionMessage(`تم تحديث حالة المستوى ${levelNumber} بنجاح.`);
      setLevels(db.getLevels());
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleUpdateTxStatus = async (txId: string, status: 'completed' | 'failed') => {
    const success = await db.updateTransactionStatusForAdmin(txId, status);
    if (success) {
      setActionMessage(`تم تحديث العملية إلى "${status === 'completed' ? 'معتمدة' : 'مرفوضة'}"`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // Calculations for Overview
  const totalUsersCount = profiles.length;
  const totalBalanceSum = profiles.reduce((acc, p) => acc + Number(p.total_balance || 0), 0);
  const totalInvestedSum = profiles.reduce((acc, p) => acc + Number(p.current_invested || 0), 0);
  const totalProfitsSum = profiles.reduce((acc, p) => acc + Number(p.total_profits || 0), 0);
  const pendingTxCount = transactions.filter((t) => t.status === 'pending').length;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">جاري التحقق من صلاحيات الدخول...</span>
        </div>
      </div>
    );
  }

  // --- Login Screen for Admin ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#0c121e] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للموقع</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">نظام الإدارة المحمي</span>
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-white mb-1">تسجيل دخول المشرف</h2>
            <p className="text-xs text-slate-400">
              هذه البوابة مخصصة للإدارة المعتمدة للمنصة فقط.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                البريد الإلكتروني للإدارة
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@invest-profit.com"
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-l from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginLoading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{loginLoading ? 'جاري التحقق...' : 'دخول إلى لوحة الإدارة'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Admin Dashboard ---
  const filteredProfiles = profiles.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.first_name && p.first_name.toLowerCase().includes(term)) ||
      (p.last_name && p.last_name.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term)) ||
      (p.referral_code && p.referral_code.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 w-full bg-[#0a0f1d] border-b border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الموقع العام</span>
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400">لوحة تحكم الإدارة العامة</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={loadingData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={async () => {
                await db.logout();
                setIsAdmin(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Action toast */}
        {actionMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>المستخدمين المسجلين ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'operations'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>العمليات والطلبات {pendingTxCount > 0 && `(${pendingTxCount} معلق)`}</span>
          </button>

          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'levels'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>مستويات الاستثمار ({levels.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">المستخدمين المسجلين</span>
                <span className="text-2xl font-mono font-bold text-white tabular-nums">
                  {totalUsersCount}
                </span>
                <span className="text-[10px] text-slate-500 block mt-2">حساب مسجل في المنصة</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي أموال الاستثمارات</span>
                <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                  ${totalInvestedSum.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-2">
                  في {investments.filter((i) => i.status === 'active').length} استثمار نشط
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">إجمالي الأرباح الموزعة</span>
                <span className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
                  ${totalProfitsSum.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-2">عائدات مدفوعة للمستثمرين</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">الطلبات المعلقة</span>
                <span className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">
                  {pendingTxCount}
                </span>
                <span className="text-[10px] text-slate-500 block mt-2">طلبات سحب تحتاج مراجعة</span>
              </div>
            </div>

            {/* Quick Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">أحدث الحسابات المسجلة</h3>
                <div className="space-y-2">
                  {profiles.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">
                          {p.first_name} {p.last_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.email}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-mono font-bold text-emerald-400 block">
                          ${Number(p.total_balance || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Level {p.current_level || 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">أحدث العمليات في النظام</h3>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{t.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(t.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="font-mono font-bold text-emerald-400 block">
                          ${Number(t.amount).toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            t.status === 'completed'
                              ? 'text-emerald-400'
                              : t.status === 'pending'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {t.status === 'completed' ? 'مكتملة' : t.status === 'pending' ? 'قيد المراجعة' : 'فشلت'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث باسم، بريد، هاتف أو كود..."
                  className="w-full px-3 py-2 pr-9 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <span className="text-xs text-slate-400">
                إجمالي: {filteredProfiles.length} مستخدم
              </span>
            </div>

            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3.5">الاسم</th>
                      <th className="p-3.5">البريد الإلكتروني</th>
                      <th className="p-3.5">الهاتف</th>
                      <th className="p-3.5">كود الإحالة</th>
                      <th className="p-3.5">المستوى</th>
                      <th className="p-3.5">الرصيد المتاح</th>
                      <th className="p-3.5">مبلغ الاستثمار</th>
                      <th className="p-3.5">إجمالي الأرباح</th>
                      <th className="p-3.5">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-white whitespace-nowrap">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{p.email}</td>
                        <td className="p-3.5 font-mono text-slate-400">{p.phone || '—'}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-300">
                          {p.referral_code || '—'}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-bold text-[10px]">
                            Level {p.current_level || 1}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          ${Number(p.total_balance || 0).toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          ${Number(p.current_invested || 0).toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-300">
                          +${Number(p.total_profits || 0).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[10px] whitespace-nowrap">
                          {new Date(p.created_at).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Operations & Approvals */}
        {activeTab === 'operations' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-3.5">نوع العملية</th>
                      <th className="p-3.5">المبلغ</th>
                      <th className="p-3.5">التفاصيل / العنوان</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">التاريخ</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                t.type === 'deposit'
                                  ? 'bg-blue-400'
                                  : t.type === 'withdrawal'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            />
                            <span>{t.title}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 tabular-nums">
                          ${Number(t.amount).toFixed(2)}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate text-[11px]">
                          {t.description || '—'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              t.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : t.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {t.status === 'completed' ? 'معتمدة' : t.status === 'pending' ? 'قيد المراجعة' : 'مرفوضة'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 text-[10px] whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="p-3.5 text-center">
                          {t.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleUpdateTxStatus(t.id, 'completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                              >
                                اعتماد
                              </button>
                              <button
                                onClick={() => handleUpdateTxStatus(t.id, 'failed')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold cursor-pointer"
                              >
                                رفض
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Levels & Plans */}
        {activeTab === 'levels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levels.map((lvl) => (
              <div
                key={lvl.id}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {lvl.level_number}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{lvl.name}</h4>
                      <span className="text-[10px] text-slate-400">
                        الحد الأدنى: ${lvl.min_investment} | الحد الأقصى: ${lvl.max_investment}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleLevel(lvl.level_number, lvl.is_unlocked)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      lvl.is_unlocked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                    }`}
                  >
                    {lvl.is_unlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{lvl.is_unlocked ? 'مفتوح للجميع' : 'مغلق (يتطلب إحالات)'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {lvl.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>الإحالات المؤهلة المطلوبة:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {lvl.required_referrals} إحالة
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
