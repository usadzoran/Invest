import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers,
  Code2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onConnected }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.key);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'sql'>('connect');

  useEffect(() => {
    const config = getSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.key);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatus('error');
      setStatusMessage('يرجى ملء رابط المشروع ومفتاح Anon العام.');
      return;
    }

    setStatus('testing');
    setStatusMessage('جاري التحقق من الاتصال بقاعدة بيانات Supabase...');

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    if (res.success) {
      saveSupabaseConfig(url.trim(), anonKey.trim());
      setStatus('success');
      setStatusMessage(res.message);
      if (onConnected) onConnected();
    } else {
      setStatus('error');
      setStatusMessage(res.message);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- =========================================================================
-- منصة «استثمر واربح» (INVEST • GROW • PROFIT) - Supabase Database Schema
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor
-- =========================================================================

create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  referral_code text unique not null,
  referred_by_code text,
  current_level integer default 1,
  total_balance numeric(12, 2) default 0.00,
  current_invested numeric(12, 2) default 0.00,
  total_profits numeric(12, 2) default 0.00,
  qualified_referrals_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. INVESTMENT LEVELS
create table if not exists public.investment_levels (
  id serial primary key,
  level_number integer unique not null,
  name text not null,
  min_investment numeric(12, 2) not null,
  max_investment numeric(12, 2) not null,
  required_referrals integer default 0,
  is_unlocked boolean default false,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INVESTMENT PLANS
create table if not exists public.investment_plans (
  id serial primary key,
  level_id integer references public.investment_levels(level_number) on delete cascade,
  amount numeric(12, 2) not null,
  daily_return numeric(12, 2) not null,
  return_percentage numeric(5, 2) not null,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INVESTMENTS
create table if not exists public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  level_id integer not null,
  plan_id integer,
  amount numeric(12, 2) not null,
  expected_daily_return numeric(12, 2) not null,
  status text default 'active',
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  next_cycle_date timestamp with time zone default timezone('utc'::text, now() + interval '24 hours') not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. DAILY CYCLES
create table if not exists public.daily_cycles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone default timezone('utc'::text, now() + interval '24 hours') not null,
  duration_hours integer default 24,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REFERRALS
create table if not exists public.referrals (
  id uuid default uuid_generate_v4() primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referred_name text not null,
  status text default 'registered',
  invested_amount numeric(12, 2) default 0.00,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. WALLETS
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  currency text not null,
  network text not null,
  balance numeric(18, 8) default 0.00,
  usd_rate numeric(12, 2) default 1.00,
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, currency)
);

-- 8. TRANSACTIONS
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  amount numeric(12, 2) default 0.00,
  title text not null,
  description text,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEED LEVELS
insert into public.investment_levels (level_number, name, min_investment, max_investment, required_referrals, is_unlocked, description)
values
  (1, 'المستوى الأول (Level 1)', 5.00, 50.00, 0, true, 'مستوى البداية مع خطط تبدأ من 5$ وتصل إلى 50$.'),
  (2, 'المستوى الثاني (Level 2)', 100.00, 500.00, 2, false, 'يتطلب إحالتين مؤهلتين قامتا بالاستثمار بأنفسهما لفتحه.'),
  (3, 'المستوى الثالث (Level 3)', 1000.00, 5000.00, 5, false, 'مستوى كبار المستثمرين.'),
  (4, 'المستوى الرابع (Level 4)', 10000.00, 50000.00, 10, false, 'مستوى الشركاء النخبة.')
on conflict (level_number) do nothing;

-- SEED PLANS
insert into public.investment_plans (level_id, amount, daily_return, return_percentage, is_custom)
values
  (1, 5.00, 1.00, 20.00, false),
  (1, 10.00, 2.00, 20.00, false),
  (1, 25.00, 5.00, 20.00, false),
  (1, 50.00, 10.00, 20.00, false),
  (2, 100.00, 25.00, 25.00, false),
  (2, 250.00, 65.00, 26.00, false),
  (2, 500.00, 140.00, 28.00, false)
on conflict do nothing;
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const isConfigured = Boolean(currentConfig.isConfigured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 rounded-3xl bg-[#0b101c] border border-emerald-500/40 p-6 sm:p-7 shadow-2xl text-right overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">إعداد والربط مع قاعدة بيانات Supabase</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isConfigured ? '🟢 متصل بـ Supabase' : '🟡 وضع التخزين المحلي النشط'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ربط مباشر مع جداول PostgreSQL ومحرك المصادقة Realtime في Supabase.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950/70 border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>بيانات الاتصال (URL & Key)</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>سكربت إنشاء الجداول (SQL Schema)</span>
          </button>
        </div>

        {/* Tab 1: Connect Form */}
        {activeTab === 'connect' && (
          <form onSubmit={handleTestAndSave} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  عنوان مشروع Supabase (Project URL):
                </label>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>لوحة تحكم Supabase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                dir="ltr"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-left"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                تجد هذا الرابط في: Supabase Dashboard &gt; Project Settings &gt; API
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                مفتاح الواجهة العامة (anon public key):
              </label>
              <textarea
                dir="ltr"
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors text-left resize-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                مفتاح الـ `anon` مخصص للواجهة الأمامية ويمكن مشاركته بأمان عبر HTTPS.
              </span>
            </div>

            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  status === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : status === 'error'
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-300'
                }`}
              >
                {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {status === 'testing' && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={status === 'testing'}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-l from-amber-400 via-emerald-400 to-emerald-300 hover:from-amber-300 hover:to-emerald-200 transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {status === 'testing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري اختبار الاتصال...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>اختبار الاتصال وحفظ الإعدادات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: SQL Script */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white block mb-1">خطوات تهيئة قاعدة البيانات في Supabase:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>انسخ كود SQL بالزر أدناه.</li>
                <li>توجه إلى لوحة تحكم مشروعك في Supabase واضغط على <strong className="text-white">SQL Editor</strong>.</li>
                <li>انقر على <strong className="text-white">New Query</strong> والصق الكود كاملاً.</li>
                <li>اضغط على زر <strong className="text-emerald-400">Run</strong> لإنشاء الجداول والبيانات فورياً!</li>
              </ol>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2 rounded-t-xl border border-b-0 border-slate-800">
                <span className="text-[11px] font-mono text-slate-400">schema.sql (8 tables + policies)</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ سكربت SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre
                dir="ltr"
                className="p-3 rounded-b-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-56 overflow-y-auto text-left"
              >
                {`-- Profiles, Investments, Daily Cycles, Referrals, Wallets, Transactions
create table if not exists public.profiles (...);
create table if not exists public.investment_levels (...);
create table if not exists public.investment_plans (...);
create table if not exists public.investments (...);
create table if not exists public.daily_cycles (...);
create table if not exists public.referrals (...);
create table if not exists public.wallets (...);
create table if not exists public.transactions (...);
-- Click "نسخ سكربت SQL" for complete executable schema`}
              </pre>
            </div>

            <button
              onClick={() => setActiveTab('connect')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
            >
              العودة لإدخال بيانات الاتصال
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
