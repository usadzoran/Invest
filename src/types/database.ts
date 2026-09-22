/**
 * Database schema types mirroring Supabase / PostgreSQL tables
 */

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password?: string;
  referral_code: string;
  referred_by_code?: string | null;
  created_at: string;
}

export interface Profile {
  user_id: string;
  current_level: number;
  total_balance: number; // In USD equivalent
  current_invested: number;
  total_profits: number;
  qualified_referrals_count: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentLevel {
  id: string;
  level_number: number;
  name: string;
  description: string;
  required_referrals: number;
  min_investment: number;
  max_investment: number;
  is_unlocked: boolean;
  badge_color: string;
}

export interface InvestmentPlan {
  id: string;
  level_id: number;
  amount: number;
  daily_return: number;
  return_percentage: number;
  duration_days: number;
  is_custom?: boolean;
}

export interface Investment {
  id: string;
  user_id: string;
  level_id: number;
  plan_id?: string;
  amount: number;
  expected_daily_return: number;
  start_date: string;
  next_cycle_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface DailyCycle {
  id: string;
  user_id: string;
  cycle_duration_seconds: number;
  started_at: number; // Unix timestamp ms
  ends_at: number; // Unix timestamp ms
  return_calculated: number;
  status: 'running' | 'completed';
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referred_name: string;
  referral_code: string;
  registered_at: string;
  status: 'registered' | 'qualified'; // 'registered' = مسجل, 'qualified' = مستثمر / مؤهل
  invested_amount: number;
}

export interface CryptoWallet {
  id: string;
  user_id: string;
  currency: 'USDT' | 'BTC' | 'ETH';
  balance: number;
  usd_rate: number;
  address: string;
  network: string;
  icon_name: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'investment' | 'return' | 'deposit' | 'withdrawal' | 'referral_bonus' | 'level_unlock';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  title: string;
  description: string;
  created_at: string;
}
