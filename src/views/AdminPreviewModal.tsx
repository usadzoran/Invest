import React, { useState } from 'react';
import { X, ShieldAlert, Users, Layers, TrendingUp, Wallet, ArrowRightLeft, Settings, Check } from 'lucide-react';
import { db } from '../services/storage';

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'levels' | 'stats'>('users');
  const users = db.getUsers();
  const profiles = db.getProfiles();
  const levels = db.getLevels();
  const plans = db.getPlans();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0b0f1a] border border-amber-500/30 p-6 shadow-2xl text-right max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">هيكل لوحة الإدارة (Admin Architecture)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Supabase Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                هيكل جاهز للربط الإداري المباشر مع جداول Supabase / PostgreSQL.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 my-4 overflow-x-auto">
          {[
            { id: 'users', label: 'المستخدمين والحسابات', icon: Users },
            { id: 'levels', label: 'المستويات وشروط الفتح', icon: Layers },
            { id: 'plans', label: 'خطط الاستثمار ونسب العوائد', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'users' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 mb-2">قائمة المستخدمين المسجلين في النظام:</h4>
              {users.map((u) => {
                const prof = profiles.find((p) => p.user_id === u.id);
                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {u.first_name} {u.last_name} ({u.referral_code})
                      </span>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        المستوى: L{prof?.current_level || 1} • الرصيد: ${prof?.total_balance.toFixed(2)} • إحالات مؤهلة: {prof?.qualified_referrals_count || 0}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      نشط
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'levels' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 mb-2">إدارة المستويات وشروط الإحالات:</h4>
              {levels.map((lvl) => (
                <div
                  key={lvl.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{lvl.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lvl.description}</p>
                    <span className="text-[10px] text-amber-300 font-mono mt-1 block">
                      الإحالات المطلوبة للتأهيل: {lvl.required_referrals} إحالات
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      lvl.is_unlocked
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {lvl.is_unlocked ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 mb-2">خطط الاستثمار والعوائد اليومية:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-white block">Level {p.level_id} Plan</span>
                      <span className="font-mono text-slate-400">مبلغ الاستثمار: ${p.amount}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-mono font-bold text-emerald-400 block">+${p.daily_return}/يوم</span>
                      <span className="text-[10px] text-slate-500">{p.return_percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>تكامل Supabase: الجداول والعلاقات مهيأة بأسماء الحقول القياسية</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
