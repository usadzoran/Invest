import React, { useState } from 'react';
import { User, Profile, InvestmentLevel } from '../types/database';
import { db } from '../services/storage';
import {
  User as UserIcon,
  Phone,
  Mail,
  Layers,
  TrendingUp,
  Coins,
  KeyRound,
  Link2,
  Copy,
  Check,
  LogOut,
  RotateCcw,
  ShieldCheck,
  History,
  CheckCircle2,
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  profile: Profile;
  levels: InvestmentLevel[];
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  onRefreshData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  profile,
  levels,
  onNavigate,
  onLogout,
  onRefreshData,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralLink = `${window.location.origin}/?ref=${user.referral_code}`;
  const recentTransactions = db.getTransactions(user.id).slice(0, 5);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto pb-10">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0d1525] to-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-950/40">
              {user.first_name?.[0] || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {user.first_name} {user.last_name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Level {profile.current_level}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="self-start sm:self-auto py-2 px-4 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Account Info & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact & Credentials Details */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-3.5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <span>المعلومات الشخصية</span>
          </h3>

          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">الاسم الكامل:</span>
            <span className="font-semibold text-white">
              {user.first_name} {user.last_name}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">رقم الهاتف:</span>
            <span className="font-mono text-slate-200" dir="ltr">
              {user.phone}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">البريد الإلكتروني:</span>
            <span className="font-mono text-slate-200" dir="ltr">
              {user.email}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-2">
            <span className="text-slate-400">تاريخ الانضمام:</span>
            <span className="text-slate-300">
              {new Date(user.created_at).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        {/* Investment & Referral Codes */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-3.5">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>بيانات الاستثمار والإحالة</span>
          </h3>

          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">المستوى الحالي:</span>
            <span className="font-bold text-amber-400">Level {profile.current_level}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">مبلغ الاستثمار الحالي:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              ${profile.current_invested.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">إجمالي العوائد والأرباح:</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              +${profile.total_profits.toFixed(2)}
            </span>
          </div>

          {/* Referral Code Quick Copy */}
          <div className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80">
            <span className="text-slate-400">Referral Code:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-300">{user.referral_code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="نسخ"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Referral Link Quick Copy */}
          <div className="flex items-center justify-between text-xs py-2">
            <span className="text-slate-400">Referral Link:</span>
            <button
              onClick={handleCopyLink}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ الرابط'}</span>
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Log Preview */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">آخر العمليات المالية</h3>
          </div>
          <button
            onClick={() => onNavigate('operations')}
            className="text-xs text-emerald-400 hover:underline cursor-pointer"
          >
            عرض السجل الكامل
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-white block">{tx.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(tx.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="text-left font-mono font-bold text-emerald-400 tabular-nums">
                {tx.amount > 0 ? `$${tx.amount.toFixed(2)}` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
