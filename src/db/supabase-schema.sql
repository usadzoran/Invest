-- =========================================================================
-- منصة «استثمر واربح» (INVEST • GROW • PROFIT) - Supabase Database Schema
-- Run this complete script in your Supabase SQL Editor: Dashboard -> SQL Editor
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & USERS TABLE
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. INVESTMENT LEVELS TABLE
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

-- 3. INVESTMENT PLANS TABLE
create table if not exists public.investment_plans (
  id serial primary key,
  level_id integer references public.investment_levels(level_number) on delete cascade,
  amount numeric(12, 2) not null,
  daily_return numeric(12, 2) not null,
  return_percentage numeric(5, 2) not null,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INVESTMENTS TABLE (User active investments)
create table if not exists public.investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  level_id integer not null,
  plan_id integer,
  amount numeric(12, 2) not null,
  expected_daily_return numeric(12, 2) not null,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  next_cycle_date timestamp with time zone default timezone('utc'::text, now() + interval '24 hours') not null,
  total_earned numeric(12, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. DAILY CYCLES TABLE (24-Hour Timer & Profit Cycle)
create table if not exists public.daily_cycles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ends_at timestamp with time zone default timezone('utc'::text, now() + interval '24 hours') not null,
  duration_hours integer default 24,
  is_completed boolean default false,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REFERRALS TABLE (Track signups & qualified investors)
create table if not exists public.referrals (
  id uuid default uuid_generate_v4() primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referred_name text not null,
  status text default 'registered' check (status in ('registered', 'qualified')),
  invested_amount numeric(12, 2) default 0.00,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  qualified_at timestamp with time zone
);

-- 7. CRYPTO WALLETS TABLE (USDT, BTC, ETH)
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  currency text not null check (currency in ('USDT', 'BTC', 'ETH')),
  network text not null,
  balance numeric(18, 8) default 0.00,
  usd_rate numeric(12, 2) default 1.00,
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, currency)
);

-- 8. TRANSACTIONS LOG TABLE
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'withdrawal', 'investment', 'return', 'referral_bonus', 'level_unlock')),
  amount numeric(12, 2) default 0.00,
  title text not null,
  description text,
  status text default 'completed' check (status in ('completed', 'pending', 'failed')),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- SEED DATA FOR INVESTMENT LEVELS & PLANS
-- =========================================================================
insert into public.investment_levels (level_number, name, min_investment, max_investment, required_referrals, is_unlocked, description)
values
  (1, 'المستوى الأول (Level 1)', 5.00, 50.00, 0, true, 'مستوى البداية لجميع المستثمرين الجدد. باقات استثمار يومية سريعة تبدأ من 5$ وتصل إلى 50$.'),
  (2, 'المستوى الثاني (Level 2)', 100.00, 500.00, 2, false, 'المستوى المتقدم بعوائد مضاعفة. يتطلب إحالتين مؤهلتين قامتا بالاستثمار بأنفسهما لفتحه.'),
  (3, 'المستوى الثالث (Level 3)', 1000.00, 5000.00, 5, false, 'مستوى كبار المستثمرين بعوائد تفضيلية حصرية.'),
  (4, 'المستوى الرابع (Level 4)', 10000.00, 50000.00, 10, false, 'مستوى الشركاء النخبة بعقود استثمارية واستراتيجية مخصصة.')
on conflict (level_number) do nothing;

-- Level 1 Plans: 5$ -> 1$, 10$ -> 2$, 25$ -> 5$, 50$ -> 10$ (20% Daily return)
insert into public.investment_plans (level_id, amount, daily_return, return_percentage, is_custom)
values
  (1, 5.00, 1.00, 20.00, false),
  (1, 10.00, 2.00, 20.00, false),
  (1, 25.00, 5.00, 20.00, false),
  (1, 50.00, 10.00, 20.00, false)
on conflict do nothing;

-- Level 2 Plans: 100$ -> 25$, 250$ -> 65$, 500$ -> 140$ (25% - 28% Daily return)
insert into public.investment_plans (level_id, amount, daily_return, return_percentage, is_custom)
values
  (2, 100.00, 25.00, 25.00, false),
  (2, 250.00, 65.00, 26.00, false),
  (2, 500.00, 140.00, 28.00, false)
on conflict do nothing;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.investment_levels enable row level security;
alter table public.investment_plans enable row level security;
alter table public.investments enable row level security;
alter table public.daily_cycles enable row level security;
alter table public.referrals enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;

-- Public read for levels and plans
create policy "Public can view investment levels" on public.investment_levels for select using (true);
create policy "Public can view investment plans" on public.investment_plans for select using (true);

-- User policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on public.investments for insert with check (auth.uid() = user_id);

create policy "Users can view own cycle" on public.daily_cycles for select using (auth.uid() = user_id);
create policy "Users can update own cycle" on public.daily_cycles for update using (auth.uid() = user_id);
create policy "Users can insert own cycle" on public.daily_cycles for insert with check (auth.uid() = user_id);

create policy "Users can view own referrals" on public.referrals for select using (auth.uid() = referrer_id);
create policy "Users can insert own referrals" on public.referrals for insert with check (auth.uid() = referrer_id);

create policy "Users can view own wallets" on public.wallets for select using (auth.uid() = user_id);
create policy "Users can update own wallets" on public.wallets for update using (auth.uid() = user_id);
create policy "Users can insert own wallets" on public.wallets for insert with check (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);

-- Realtime enablement
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.investments;
alter publication supabase_realtime add table public.daily_cycles;
alter publication supabase_realtime add table public.referrals;
alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.transactions;
