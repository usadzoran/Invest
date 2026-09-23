import {
  User,
  Profile,
  InvestmentLevel,
  InvestmentPlan,
  Investment,
  DailyCycle,
  Referral,
  CryptoWallet,
  Transaction,
} from '../types/database';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// Production Supabase configuration (matches active project)
const DEFAULT_SUPABASE_URL = 'https://ibpdmvsimyjbafhxwtrb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicGRtdnNpbXlqYmFmaHh3dHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzM0MjksImV4cCI6MjEwNTY0OTQyOX0.eFRgiJqjlgX8DCvtRp580LO1hz338nCjjb2enS83I8Q';

// Retrieve Supabase credentials from Vite import.meta.env, process.env, localStorage, or project defaults
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key] || '';
    }
  } catch {}
  return '';
};

const envUrl = getEnvVar('VITE_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('invest_app_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('invest_app_supabase_key') || '' : '';

export const SUPABASE_URL: string =
  (envUrl && envUrl !== 'https://your-project.supabase.co' ? envUrl.trim() : '') ||
  localUrl.trim() ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY: string =
  (envKey && envKey !== 'your-anon-public-key' ? envKey.trim() : '') ||
  localKey.trim() ||
  DEFAULT_SUPABASE_ANON_KEY;

// Export the initialized Supabase client instance
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('https://')
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

// Helper to retrieve the current client instance
export const getSupabase = (): SupabaseClient | null => supabase;

export const CYCLE_DURATION_MS = 24 * 60 * 60 * 1000;

// Initial fallback levels (matches supabase-schema.sql)
const DEFAULT_LEVELS: InvestmentLevel[] = [
  {
    id: '1',
    level_number: 1,
    name: 'المستوى الأول (Level 1)',
    description: 'مستوى البداية لجميع المستثمرين الجدد. باقات استثمار يومية سريعة تبدأ من 5$ وتصل إلى 50$.',
    required_referrals: 0,
    min_investment: 5.0,
    max_investment: 50.0,
    is_unlocked: true,
    badge_color: 'emerald',
  },
  {
    id: '2',
    level_number: 2,
    name: 'المستوى الثاني (Level 2)',
    description: 'المستوى المتقدم بعوائد مضاعفة. يتطلب إحالتين مؤهلتين قامتا بالاستثمار بأنفسهما لفتحه.',
    required_referrals: 2,
    min_investment: 100.0,
    max_investment: 500.0,
    is_unlocked: false,
    badge_color: 'amber',
  },
  {
    id: '3',
    level_number: 3,
    name: 'المستوى الثالث (Level 3)',
    description: 'مستوى كبار المستثمرين بعوائد تفضيلية حصرية.',
    required_referrals: 5,
    min_investment: 1000.0,
    max_investment: 5000.0,
    is_unlocked: false,
    badge_color: 'blue',
  },
  {
    id: '4',
    level_number: 4,
    name: 'المستوى الرابع (Level 4)',
    description: 'مستوى الشركاء النخبة بعقود استثمارية واستراتيجية مخصصة.',
    required_referrals: 10,
    min_investment: 10000.0,
    max_investment: 50000.0,
    is_unlocked: false,
    badge_color: 'purple',
  },
];

const DEFAULT_PLANS: InvestmentPlan[] = [
  { id: '1', level_id: 1, amount: 5.0, daily_return: 1.0, return_percentage: 20.0, duration_days: 1, is_custom: false },
  { id: '2', level_id: 1, amount: 10.0, daily_return: 2.0, return_percentage: 20.0, duration_days: 1, is_custom: false },
  { id: '3', level_id: 1, amount: 25.0, daily_return: 5.0, return_percentage: 20.0, duration_days: 1, is_custom: false },
  { id: '4', level_id: 1, amount: 50.0, daily_return: 10.0, return_percentage: 20.0, duration_days: 1, is_custom: false },
  { id: '5', level_id: 2, amount: 100.0, daily_return: 25.0, return_percentage: 25.0, duration_days: 1, is_custom: false },
  { id: '6', level_id: 2, amount: 250.0, daily_return: 65.0, return_percentage: 26.0, duration_days: 1, is_custom: false },
  { id: '7', level_id: 2, amount: 500.0, daily_return: 140.0, return_percentage: 28.0, duration_days: 1, is_custom: false },
];

class DatabaseService {
  private currentUser: User | null = null;
  private currentProfile: Profile | null = null;
  private userWallets: CryptoWallet[] = [];
  private userInvestments: Investment[] = [];
  private userTransactions: Transaction[] = [];
  private userReferrals: Referral[] = [];
  private userCycle: DailyCycle | null = null;
  private levels: InvestmentLevel[] = DEFAULT_LEVELS;
  private plans: InvestmentPlan[] = DEFAULT_PLANS;
  private listeners: (() => void)[] = [];
  private isInitialized = false;
  private realtimeChannel: RealtimeChannel | null = null;

  constructor() {
    this.init();
  }

  // --- Realtime / Listeners ---
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('DatabaseService listener notify error:', err);
      }
    });
  }

  // --- Initialization directly with Supabase ---
  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client is not ready.');
      return;
    }

    try {
      // 1. Fetch public investment levels and plans from Supabase
      await this.fetchLevelsAndPlans();

      // 2. Check active auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await this.handleUserSession(session.user);
      }

      // 3. Listen to auth state changes in Supabase Auth
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (newSession?.user) {
          await this.handleUserSession(newSession.user);
        } else {
          this.cleanupSession();
          this.notify();
        }
      });
    } catch (err) {
      console.error('Error during Supabase initialization:', err);
    }
  }

  // --- Cleanup session on logout ---
  private cleanupSession() {
    if (this.realtimeChannel) {
      const supabase = getSupabase();
      if (supabase) {
        supabase.removeChannel(this.realtimeChannel);
      }
      this.realtimeChannel = null;
    }
    this.currentUser = null;
    this.currentProfile = null;
    this.userWallets = [];
    this.userInvestments = [];
    this.userTransactions = [];
    this.userReferrals = [];
    this.userCycle = null;
  }

  // --- Load public investment levels and plans directly from Supabase ---
  async fetchLevelsAndPlans() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data: dbLevels, error: lvlErr } = await supabase
        .from('investment_levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (!lvlErr && dbLevels && dbLevels.length > 0) {
        this.levels = dbLevels.map((lvl) => ({
          id: String(lvl.id),
          level_number: lvl.level_number,
          name: lvl.name,
          description: lvl.description || '',
          required_referrals: lvl.required_referrals || 0,
          min_investment: Number(lvl.min_investment),
          max_investment: Number(lvl.max_investment),
          is_unlocked: Boolean(lvl.is_unlocked),
          badge_color:
            lvl.level_number === 1
              ? 'emerald'
              : lvl.level_number === 2
              ? 'amber'
              : lvl.level_number === 3
              ? 'blue'
              : 'purple',
        }));
      }

      const { data: dbPlans, error: planErr } = await supabase
        .from('investment_plans')
        .select('*')
        .order('amount', { ascending: true });

      if (!planErr && dbPlans && dbPlans.length > 0) {
        this.plans = dbPlans.map((p) => ({
          id: String(p.id),
          level_id: p.level_id,
          amount: Number(p.amount),
          daily_return: Number(p.daily_return),
          return_percentage: Number(p.return_percentage),
          duration_days: 1,
          is_custom: Boolean(p.is_custom),
        }));
      }

      this.notify();
    } catch (e) {
      console.error('Failed to fetch levels/plans from Supabase:', e);
    }
  }

  // --- Load Authenticated User Data from Supabase ---
  private async handleUserSession(authUser: any) {
    const supabase = getSupabase();
    if (!supabase) return;

    const meta = authUser.user_metadata || {};
    const email = authUser.email || '';

    // Build Current User Object
    this.currentUser = {
      id: authUser.id,
      first_name: meta.first_name || email.split('@')[0] || 'مستثمر',
      last_name: meta.last_name || '',
      phone: meta.phone || '',
      email: email,
      referral_code: meta.referral_code || 'ARB' + authUser.id.substring(0, 4).toUpperCase(),
      referred_by_code: meta.referred_by_code || null,
      created_at: authUser.created_at || new Date().toISOString(),
    };

    await this.fetchUserData(authUser.id);
    this.setupRealtimeSubscription(authUser.id);
  }

  // --- Fetch all tables for a specific user directly from Supabase ---
  async fetchUserData(userId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // 1. Fetch Profile
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileRow) {
        this.currentProfile = {
          user_id: profileRow.id,
          current_level: profileRow.current_level || 1,
          total_balance: Number(profileRow.total_balance || 0),
          current_invested: Number(profileRow.current_invested || 0),
          total_profits: Number(profileRow.total_profits || 0),
          qualified_referrals_count: profileRow.qualified_referrals_count || 0,
          created_at: profileRow.created_at,
          updated_at: profileRow.updated_at,
        };
      } else if (this.currentUser) {
        // Automatically create initial profile in Supabase if missing
        const initialProfile = {
          id: userId,
          first_name: this.currentUser.first_name,
          last_name: this.currentUser.last_name,
          phone: this.currentUser.phone,
          email: this.currentUser.email,
          referral_code: this.currentUser.referral_code,
          referred_by_code: this.currentUser.referred_by_code,
          current_level: 1,
          total_balance: 0.0,
          current_invested: 0.0,
          total_profits: 0.0,
          qualified_referrals_count: 0,
        };

        const { data: createdProf } = await supabase
          .from('profiles')
          .insert(initialProfile)
          .select()
          .maybeSingle();

        if (createdProf) {
          this.currentProfile = {
            user_id: createdProf.id,
            current_level: createdProf.current_level,
            total_balance: Number(createdProf.total_balance),
            current_invested: Number(createdProf.current_invested),
            total_profits: Number(createdProf.total_profits),
            qualified_referrals_count: createdProf.qualified_referrals_count,
            created_at: createdProf.created_at,
            updated_at: createdProf.updated_at,
          };
        }
      }

      // 2. Fetch Wallets
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId);

      if (walletsData && walletsData.length > 0) {
        this.userWallets = walletsData.map((w) => ({
          id: w.id,
          user_id: w.user_id,
          currency: w.currency as 'USDT' | 'BTC' | 'ETH',
          balance: Number(w.balance || 0),
          usd_rate: Number(w.usd_rate || (w.currency === 'USDT' ? 1 : w.currency === 'BTC' ? 68500 : 3450)),
          address: w.address,
          network:
            w.network ||
            (w.currency === 'USDT'
              ? 'TRC20 (Tron)'
              : w.currency === 'BTC'
              ? 'Bitcoin Mainnet'
              : 'Ethereum (ERC20)'),
          icon_name: w.currency === 'USDT' ? 'DollarSign' : w.currency === 'BTC' ? 'Bitcoin' : 'Coins',
        }));
      } else {
        // Initialize default wallets in Supabase for user
        const defaultWallets = [
          {
            user_id: userId,
            currency: 'USDT',
            network: 'TRC20 (Tron)',
            balance: 0.0,
            usd_rate: 1.0,
            address: 'TRX' + Math.random().toString(36).substring(2, 10).toUpperCase() + '9wK',
          },
          {
            user_id: userId,
            currency: 'BTC',
            network: 'Bitcoin Mainnet',
            balance: 0.0,
            usd_rate: 68500.0,
            address: '1' + Math.random().toString(36).substring(2, 12).toUpperCase(),
          },
          {
            user_id: userId,
            currency: 'ETH',
            network: 'Ethereum (ERC20)',
            balance: 0.0,
            usd_rate: 3450.0,
            address: '0x' + Math.random().toString(36).substring(2, 16),
          },
        ];

        const { data: insWallets } = await supabase
          .from('wallets')
          .insert(defaultWallets)
          .select();

        if (insWallets) {
          this.userWallets = insWallets.map((w) => ({
            id: w.id,
            user_id: w.user_id,
            currency: w.currency as 'USDT' | 'BTC' | 'ETH',
            balance: Number(w.balance || 0),
            usd_rate: Number(w.usd_rate),
            address: w.address,
            network: w.network,
            icon_name: w.currency === 'USDT' ? 'DollarSign' : w.currency === 'BTC' ? 'Bitcoin' : 'Coins',
          }));
        }
      }

      // 3. Fetch Investments
      const { data: invsData } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (invsData) {
        this.userInvestments = invsData.map((inv) => ({
          id: inv.id,
          user_id: inv.user_id,
          level_id: inv.level_id,
          plan_id: inv.plan_id ? String(inv.plan_id) : undefined,
          amount: Number(inv.amount),
          expected_daily_return: Number(inv.expected_daily_return),
          start_date: inv.start_date,
          next_cycle_date: inv.next_cycle_date,
          status: inv.status as 'active' | 'completed' | 'cancelled',
          created_at: inv.created_at,
        }));
      }

      // 4. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txData) {
        this.userTransactions = txData.map((t) => ({
          id: t.id,
          user_id: t.user_id,
          type: t.type as any,
          amount: Number(t.amount),
          currency: 'USD',
          status: (t.status as any) || 'completed',
          title: t.title,
          description: t.description || '',
          created_at: t.created_at,
        }));
      }

      // 5. Fetch Referrals
      const { data: refData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('registered_at', { ascending: false });

      if (refData) {
        this.userReferrals = refData.map((r) => ({
          id: r.id,
          referrer_id: r.referrer_id,
          referred_user_id: r.referred_user_id,
          referred_name: r.referred_name || 'مستثمر',
          referral_code: this.currentUser?.referral_code || '',
          registered_at: r.registered_at,
          status: r.status as 'registered' | 'qualified',
          invested_amount: Number(r.invested_amount || 0),
        }));
      }

      // 6. Fetch Daily Cycle
      const { data: cycleData } = await supabase
        .from('daily_cycles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cycleData) {
        const startMs = new Date(cycleData.started_at).getTime();
        const endMs = new Date(cycleData.ends_at).getTime();
        const now = Date.now();
        if (endMs > now) {
          this.userCycle = {
            id: cycleData.id,
            user_id: cycleData.user_id,
            cycle_duration_seconds: (cycleData.duration_hours || 24) * 3600,
            started_at: startMs,
            ends_at: endMs,
            return_calculated: 0,
            status: 'running',
          };
        } else {
          this.userCycle = {
            id: 'cyc_' + userId + '_' + now,
            user_id: userId,
            cycle_duration_seconds: 24 * 3600,
            started_at: now,
            ends_at: now + CYCLE_DURATION_MS,
            return_calculated: 0,
            status: 'running',
          };
        }
      } else {
        const now = Date.now();
        this.userCycle = {
          id: 'cyc_' + userId,
          user_id: userId,
          cycle_duration_seconds: 24 * 3600,
          started_at: now,
          ends_at: now + CYCLE_DURATION_MS,
          return_calculated: 0,
          status: 'running',
        };
      }
    } catch (err) {
      console.error('Error in fetchUserData from Supabase:', err);
    }

    this.notify();
  }

  // --- Realtime subscription to receive database updates instantly ---
  private setupRealtimeSubscription(userId: string) {
    const supabase = getSupabase();
    if (!supabase) return;

    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = supabase
      .channel(`user-sync-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        () => this.fetchUserData(userId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${userId}` },
        () => this.fetchUserData(userId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        () => this.fetchUserData(userId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investments', filter: `user_id=eq.${userId}` },
        () => this.fetchUserData(userId)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investment_levels' },
        () => this.fetchLevelsAndPlans()
      )
      .subscribe();
  }

  // --- Re-sync all user data ---
  async refreshUserData(userId?: string): Promise<void> {
    const targetId = userId || this.currentUser?.id;
    if (targetId) {
      await this.fetchUserData(targetId);
    }
    await this.fetchLevelsAndPlans();
  }

  // --- Auth Methods directly against Supabase Auth ---
  async loginUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'تعذر الاتصال بقاعدة بيانات Supabase.' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password || '',
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المرسل إليك قبل تسجيل الدخول.';
        }
        return { success: false, error: msg };
      }

      if (data.user) {
        await this.handleUserSession(data.user);
        return { success: true, user: this.currentUser || undefined };
      }

      return { success: false, error: 'تعذر استرجاع بيانات المستخدم.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'حدث خطأ أثناء تسجيل الدخول.' };
    }
  }

  async registerUser(params: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password?: string;
    referred_by_code?: string;
  }): Promise<{
    success: boolean;
    user?: User;
    requiresEmailConfirmation?: boolean;
    message?: string;
    error?: string;
  }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'تعذر الاتصال بخدمة المصادقة.' };
    }

    try {
      const cleanEmail = params.email.trim().toLowerCase();
      const referralCode = 'ARB' + Math.floor(100000 + Math.random() * 900000);
      const cleanRefCode = params.referred_by_code?.trim().toUpperCase() || null;

      // Check if referrer exists in Supabase
      let referrerId: string | null = null;
      if (cleanRefCode) {
        const { data: referrerProf } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', cleanRefCode)
          .maybeSingle();

        if (referrerProf) {
          referrerId = referrerProf.id;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password || '',
        options: {
          data: {
            first_name: params.first_name.trim(),
            last_name: params.last_name.trim(),
            phone: params.phone.trim(),
            referral_code: referralCode,
            referred_by_code: cleanRefCode,
          },
        },
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('User already registered')) {
          msg = 'هذا البريد الإلكتروني مسجل مسبقاً.';
        } else if (msg.includes('Password should be')) {
          msg = 'كلمة المرور يجب أن لا تقل عن 6 أحرف.';
        }
        return { success: false, error: msg };
      }

      if (data.user) {
        // Record referral row in Supabase referrals table if referrer exists
        if (referrerId) {
          await supabase.from('referrals').insert({
            referrer_id: referrerId,
            referred_user_id: data.user.id,
            referred_name: `${params.first_name.trim()} ${params.last_name.trim()}`,
            status: 'registered',
            invested_amount: 0.0,
            registered_at: new Date().toISOString(),
          });
        }

        if (data.session) {
          await this.handleUserSession(data.user);
          return { success: true, user: this.currentUser || undefined };
        } else {
          return {
            success: true,
            requiresEmailConfirmation: true,
            message:
              'تم إنشاء حسابك بنجاح! تم إرسال رابط تأكيد إلى بريدك الإلكتروني، يرجى النقر عليه لتفعيل حسابك ثم تسجيل الدخول.',
          };
        }
      }

      return { success: false, error: 'فشل إتمام التسجيل.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'حدث خطأ أثناء التسجيل.' };
    }
  }

  async logout(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.cleanupSession();
    this.notify();
  }

  // --- Getters (Preserving identical signatures for all components) ---
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserProfile(userId?: string): Profile | null {
    if (this.currentProfile) return this.currentProfile;
    if (this.currentUser) {
      return {
        user_id: this.currentUser.id,
        current_level: 1,
        total_balance: 0.0,
        current_invested: 0.0,
        total_profits: 0.0,
        qualified_referrals_count: 0,
        created_at: this.currentUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  }

  getLevels(): InvestmentLevel[] {
    return this.levels && this.levels.length > 0 ? this.levels : DEFAULT_LEVELS;
  }

  getPlans(): InvestmentPlan[] {
    return this.plans && this.plans.length > 0 ? this.plans : DEFAULT_PLANS;
  }

  getPlansForLevel(levelNumber: number): InvestmentPlan[] {
    const plans = this.getPlans();
    return plans.filter((p) => p.level_id === levelNumber);
  }

  getWallets(userId?: string): CryptoWallet[] {
    if (this.userWallets && this.userWallets.length > 0) return this.userWallets;
    const uid = userId || this.currentUser?.id || 'usr';
    return [
      {
        id: 'w_usdt',
        user_id: uid,
        currency: 'USDT',
        network: 'TRC20 (Tron)',
        balance: 0.0,
        usd_rate: 1.0,
        address: 'TRX7xK9pM3nL4vQ2wE1yZ8sT6uJ9wK',
        icon_name: 'DollarSign',
      },
      {
        id: 'w_btc',
        user_id: uid,
        currency: 'BTC',
        network: 'Bitcoin Mainnet',
        balance: 0.0,
        usd_rate: 68500.0,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        icon_name: 'Bitcoin',
      },
      {
        id: 'w_eth',
        user_id: uid,
        currency: 'ETH',
        network: 'Ethereum (ERC20)',
        balance: 0.0,
        usd_rate: 3450.0,
        address: '0x71C...4982a',
        icon_name: 'Coins',
      },
    ];
  }

  getInvestments(userId?: string): Investment[] {
    return this.userInvestments;
  }

  getTransactions(userId?: string): Transaction[] {
    return this.userTransactions;
  }

  getReferrals(userId?: string): Referral[] {
    return this.userReferrals;
  }

  getUserDailyCycle(userId?: string): DailyCycle {
    if (this.userCycle) return this.userCycle;
    const now = Date.now();
    return {
      id: 'cyc_active',
      user_id: this.currentUser?.id || 'usr',
      cycle_duration_seconds: 24 * 3600,
      started_at: now,
      ends_at: now + CYCLE_DURATION_MS,
      return_calculated: 0,
      status: 'running',
    };
  }

  // --- Financial Operations directly to Supabase ---
  async depositToWallet(
    userId: string,
    currency: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'تعذر الاتصال بالخادم.' };

    try {
      // Find wallet
      const wallet = this.userWallets.find((w) => w.currency === currency);
      const newWalletBal = (wallet?.balance || 0) + amount;
      const newTotalBal = (this.currentProfile?.total_balance || 0) + amount;

      // Update in Supabase
      if (wallet) {
        await supabase
          .from('wallets')
          .update({ balance: newWalletBal })
          .eq('id', wallet.id);
      }

      await supabase
        .from('profiles')
        .update({ total_balance: newTotalBal })
        .eq('id', userId);

      // Insert transaction in Supabase
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount: amount,
        title: `إيداع محفظة ${currency}`,
        description: `إيداع ناجح بقيمة ${amount} ${currency}`,
        status: 'completed',
      });

      // Synchronize directly from Supabase
      await this.fetchUserData(userId);
      return { success: true };
    } catch (e: any) {
      console.error('Deposit error:', e);
      return { success: false, error: e?.message || 'فشلت عملية الإيداع.' };
    }
  }

  async withdrawFromWallet(
    userId: string,
    currency: string,
    amount: number,
    targetAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'تعذر الاتصال بالخادم.' };

    const wallet = this.userWallets.find((w) => w.currency === currency);
    if (!wallet || wallet.balance < amount) {
      return { success: false, error: 'رصيد المحفظة المحدد غير كافٍ لإتمام عملية السحب.' };
    }

    try {
      const newWalletBal = wallet.balance - amount;
      const newTotalBal = Math.max(0, (this.currentProfile?.total_balance || 0) - amount);

      // Update wallet and profile in Supabase
      await supabase
        .from('wallets')
        .update({ balance: newWalletBal })
        .eq('id', wallet.id);

      await supabase
        .from('profiles')
        .update({ total_balance: newTotalBal })
        .eq('id', userId);

      // Insert transaction in Supabase (pending for admin approval / verification)
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: amount,
        title: `طلب سحب ${currency}`,
        description: `طلب سحب إلى العنوان: ${targetAddress}`,
        status: 'pending',
        metadata: { targetAddress, currency },
      });

      // Synchronize directly from Supabase
      await this.fetchUserData(userId);
      return { success: true };
    } catch (e: any) {
      console.error('Withdrawal error:', e);
      return { success: false, error: e?.message || 'فشلت عملية السحب.' };
    }
  }

  async createInvestment(params: {
    userId: string;
    levelId: number;
    amount: number;
    expectedDailyReturn: number;
    planId?: string;
  }): Promise<{ success: boolean; investment?: Investment; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'تعذر الاتصال بالخادم.' };

    if (!this.currentProfile || this.currentProfile.total_balance < params.amount) {
      return { success: false, error: 'الرصيد المتاح غير كافٍ لإتمام هذا الاستثمار.' };
    }

    try {
      const now = new Date();
      const nextCycle = new Date(now.getTime() + CYCLE_DURATION_MS);

      // 1. Insert Investment into Supabase
      const { data: invRow, error: invErr } = await supabase
        .from('investments')
        .insert({
          user_id: params.userId,
          level_id: params.levelId,
          plan_id: params.planId ? Number(params.planId) || null : null,
          amount: params.amount,
          expected_daily_return: params.expectedDailyReturn,
          start_date: now.toISOString(),
          next_cycle_date: nextCycle.toISOString(),
          status: 'active',
          total_earned: 0,
        })
        .select()
        .maybeSingle();

      if (invErr) {
        console.error('Investment insert error:', invErr);
        return { success: false, error: invErr.message };
      }

      // 2. Update Profile Balance & Invested in Supabase
      const newTotalBal = this.currentProfile.total_balance - params.amount;
      const newInvested = this.currentProfile.current_invested + params.amount;

      await supabase
        .from('profiles')
        .update({
          total_balance: newTotalBal,
          current_invested: newInvested,
        })
        .eq('id', params.userId);

      // 3. Insert Transaction into Supabase
      await supabase.from('transactions').insert({
        user_id: params.userId,
        type: 'investment',
        amount: params.amount,
        title: `استثمار جديد - Level ${params.levelId}`,
        description: `مبلغ $${params.amount} بعائد يومي متوقع $${params.expectedDailyReturn}`,
        status: 'completed',
      });

      // 4. Check if this user was referred by someone and update referral status to qualified
      const { data: refRecord } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_user_id', params.userId)
        .eq('status', 'registered')
        .maybeSingle();

      if (refRecord) {
        await supabase
          .from('referrals')
          .update({
            status: 'qualified',
            invested_amount: params.amount,
            qualified_at: now.toISOString(),
          })
          .eq('id', refRecord.id);

        const { data: refProfile } = await supabase
          .from('profiles')
          .select('id, qualified_referrals_count, total_balance, total_profits')
          .eq('id', refRecord.referrer_id)
          .maybeSingle();

        if (refProfile) {
          const newQ = (refProfile.qualified_referrals_count || 0) + 1;
          const referralBonus = 5.0; // $5 instant bonus for referrer
          await supabase
            .from('profiles')
            .update({
              qualified_referrals_count: newQ,
              total_balance: Number(refProfile.total_balance || 0) + referralBonus,
              total_profits: Number(refProfile.total_profits || 0) + referralBonus,
            })
            .eq('id', refProfile.id);

          await supabase.from('transactions').insert({
            user_id: refProfile.id,
            type: 'referral_bonus',
            amount: referralBonus,
            title: 'مكافأة إحالة مؤهلة استثمرت',
            description: `مكافأة تأهل إحالتك بقيمة $${referralBonus}`,
            status: 'completed',
          });
        }
      }

      // 5. Ensure active daily cycle in Supabase
      const { data: existingCycle } = await supabase
        .from('daily_cycles')
        .select('id')
        .eq('user_id', params.userId)
        .eq('is_completed', false)
        .maybeSingle();

      if (!existingCycle) {
        await supabase.from('daily_cycles').insert({
          user_id: params.userId,
          started_at: now.toISOString(),
          ends_at: nextCycle.toISOString(),
          duration_hours: 24,
          is_completed: false,
        });
      }

      // Synchronize directly from Supabase
      await this.fetchUserData(params.userId);

      const createdInvestment: Investment = {
        id: invRow.id,
        user_id: invRow.user_id,
        level_id: invRow.level_id,
        plan_id: invRow.plan_id ? String(invRow.plan_id) : undefined,
        amount: Number(invRow.amount),
        expected_daily_return: Number(invRow.expected_daily_return),
        start_date: invRow.start_date,
        next_cycle_date: invRow.next_cycle_date,
        status: 'active',
        created_at: invRow.created_at,
      };

      return { success: true, investment: createdInvestment };
    } catch (e: any) {
      console.error('Investment creation error:', e);
      return { success: false, error: e?.message || 'فشلت عملية إنشاء الاستثمار.' };
    }
  }

  async processCycleCompletion(
    userId: string
  ): Promise<{ returnedAmount: number }> {
    const supabase = getSupabase();
    if (!supabase) return { returnedAmount: 0 };

    const activeInvs = this.userInvestments.filter((i) => i.status === 'active');
    const totalDailyReturn = activeInvs.reduce(
      (acc, inv) => acc + inv.expected_daily_return,
      0
    );

    const now = new Date();
    const nextCycle = new Date(now.getTime() + CYCLE_DURATION_MS);

    // Immediately reset in-memory cycle to advance timer and prevent loop
    this.userCycle = {
      id: 'cyc_' + userId + '_' + now.getTime(),
      user_id: userId,
      cycle_duration_seconds: 24 * 3600,
      started_at: now.getTime(),
      ends_at: nextCycle.getTime(),
      return_calculated: 0,
      status: 'running',
    };

    if (totalDailyReturn <= 0 || !this.currentProfile) {
      // Advance cycle in Supabase even when there are no active returns
      try {
        await supabase
          .from('daily_cycles')
          .update({ is_completed: true, processed_at: now.toISOString() })
          .eq('user_id', userId)
          .eq('is_completed', false);

        await supabase.from('daily_cycles').insert({
          user_id: userId,
          started_at: now.toISOString(),
          ends_at: nextCycle.toISOString(),
          duration_hours: 24,
          is_completed: false,
        });
      } catch (err) {
        console.warn('Could not roll over empty cycle:', err);
      }
      return { returnedAmount: 0 };
    }

    try {
      const newTotalBal = this.currentProfile.total_balance + totalDailyReturn;
      const newProfits = this.currentProfile.total_profits + totalDailyReturn;

      // Update in Supabase
      await supabase
        .from('profiles')
        .update({
          total_balance: newTotalBal,
          total_profits: newProfits,
        })
        .eq('id', userId);

      // Record return transaction in Supabase
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'return',
        amount: totalDailyReturn,
        title: 'عائد الدورة اليومية المكتملة',
        description: `تم إضافة العائد اليومي بقيمة $${totalDailyReturn.toFixed(2)} بنجاح إلى رصيدك.`,
        status: 'completed',
      });

      // Mark current cycle as completed and start new 24h cycle
      const now = new Date();
      const nextCycle = new Date(now.getTime() + CYCLE_DURATION_MS);

      await supabase
        .from('daily_cycles')
        .update({ is_completed: true, processed_at: now.toISOString() })
        .eq('user_id', userId)
        .eq('is_completed', false);

      await supabase.from('daily_cycles').insert({
        user_id: userId,
        started_at: now.toISOString(),
        ends_at: nextCycle.toISOString(),
        duration_hours: 24,
        is_completed: false,
      });

      // Refresh directly from Supabase
      await this.fetchUserData(userId);
      return { returnedAmount: totalDailyReturn };
    } catch (e) {
      console.error('Cycle completion error:', e);
      return { returnedAmount: 0 };
    }
  }

  // --- Real Admin queries for `/secure-admin` from Supabase ---
  async checkIsAdmin(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      // Check configured admin emails or metadata
      const adminEmails = ['wahablila31000@gmail.com', 'admin@invest-profit.com'];
      if (adminEmails.includes(user.email || '')) return true;

      if (
        user.app_metadata?.role === 'admin' ||
        user.user_metadata?.role === 'admin'
      ) {
        return true;
      }

      // Check profile role column in Supabase
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (prof && (prof as any).role === 'admin') {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  async getAllProfilesForAdmin(): Promise<any[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async getAllTransactionsForAdmin(): Promise<any[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async getAllInvestmentsForAdmin(): Promise<any[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async updateTransactionStatusForAdmin(
    txId: string,
    status: 'completed' | 'failed'
  ): Promise<{ success: boolean }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false };

    try {
      // If rejecting a withdrawal, refund the balance back to the user
      if (status === 'failed') {
        const { data: tx } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', txId)
          .maybeSingle();

        if (tx && tx.type === 'withdrawal' && tx.status === 'pending') {
          const { data: prof } = await supabase
            .from('profiles')
            .select('total_balance')
            .eq('id', tx.user_id)
            .maybeSingle();

          if (prof) {
            await supabase
              .from('profiles')
              .update({ total_balance: Number(prof.total_balance || 0) + Number(tx.amount) })
              .eq('id', tx.user_id);
          }
        }
      }

      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', txId);

      return { success: !error };
    } catch (e) {
      console.error('Error updating transaction status:', e);
      return { success: false };
    }
  }

  async toggleLevelUnlockForAdmin(
    levelNumber: number,
    isUnlocked: boolean
  ): Promise<{ success: boolean }> {
    const client = getSupabase();
    if (!client) return { success: false };
    const { error } = await client
      .from('investment_levels')
      .update({ is_unlocked: isUnlocked })
      .eq('level_number', levelNumber);

    if (!error) {
      await this.fetchLevelsAndPlans();
    }
    return { success: !error };
  }

  // Direct access to the Supabase client instance
  get supabaseClient(): SupabaseClient | null {
    return supabase;
  }
}

export const db = new DatabaseService();

