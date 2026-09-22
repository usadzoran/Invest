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
import { getSupabase } from './supabase';

export const CYCLE_DURATION_MS = 24 * 60 * 60 * 1000;

class DatabaseService {
  private currentUser: User | null = null;
  private currentProfile: Profile | null = null;
  private userWallets: CryptoWallet[] = [];
  private userInvestments: Investment[] = [];
  private userTransactions: Transaction[] = [];
  private userReferrals: Referral[] = [];
  private userCycle: DailyCycle | null = null;
  private levels: InvestmentLevel[] = [];
  private plans: InvestmentPlan[] = [];
  private listeners: (() => void)[] = [];
  private isInitialized = false;

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
        console.error('Listener notify error:', err);
      }
    });
  }

  // --- Initialization with Supabase ---
  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const supabase = getSupabase();
    if (!supabase) {
      console.warn('Supabase client is not available yet.');
      return;
    }

    try {
      // 1. Fetch public investment levels
      await this.fetchLevelsAndPlans();

      // 2. Check active auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await this.handleUserSession(session.user);
      }

      // 3. Listen to auth state changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (newSession?.user) {
          await this.handleUserSession(newSession.user);
        } else {
          this.currentUser = null;
          this.currentProfile = null;
          this.userWallets = [];
          this.userInvestments = [];
          this.userTransactions = [];
          this.userReferrals = [];
          this.userCycle = null;
          this.notify();
        }
      });
    } catch (err) {
      console.error('Error during Supabase init:', err);
    }
  }

  // --- Load public investment levels and plans from Supabase ---
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
      console.error('Failed to fetch levels/plans:', e);
    }
  }

  // --- Load Authenticated User Data from Supabase ---
  private async handleUserSession(authUser: any) {
    const supabase = getSupabase();
    if (!supabase) return;

    const meta = authUser.user_metadata || {};
    const email = authUser.email || '';

    // Build User Object
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

    try {
      // 1. Fetch Profile
      const { data: profileRow, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
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
      } else {
        // Create initial profile in Supabase
        const initialProfile = {
          id: authUser.id,
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

        const { data: createdProf, error: insErr } = await supabase
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
        } else {
          this.currentProfile = {
            user_id: authUser.id,
            current_level: 1,
            total_balance: 0,
            current_invested: 0,
            total_profits: 0,
            qualified_referrals_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }

      // 2. Fetch Wallets
      const { data: walletsData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authUser.id);

      if (walletsData && walletsData.length > 0) {
        this.userWallets = walletsData.map((w) => ({
          id: w.id,
          user_id: w.user_id,
          currency: w.currency as 'USDT' | 'BTC' | 'ETH',
          balance: Number(w.balance || 0),
          usd_rate: Number(w.usd_rate || (w.currency === 'USDT' ? 1 : w.currency === 'BTC' ? 68500 : 3450)),
          address: w.address,
          network: w.network || (w.currency === 'USDT' ? 'TRC20 (Tron)' : w.currency === 'BTC' ? 'Bitcoin Mainnet' : 'Ethereum (ERC20)'),
          icon_name: w.currency === 'USDT' ? 'DollarSign' : w.currency === 'BTC' ? 'Bitcoin' : 'Coins',
        }));
      } else {
        // Create initial wallets
        const defaultWallets = [
          {
            user_id: authUser.id,
            currency: 'USDT',
            network: 'TRC20 (Tron)',
            balance: 0.0,
            usd_rate: 1.0,
            address: 'TRX' + Math.random().toString(36).substring(2, 10).toUpperCase() + '9wK',
          },
          {
            user_id: authUser.id,
            currency: 'BTC',
            network: 'Bitcoin Mainnet',
            balance: 0.0,
            usd_rate: 68500.0,
            address: '1' + Math.random().toString(36).substring(2, 12).toUpperCase(),
          },
          {
            user_id: authUser.id,
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
        .eq('user_id', authUser.id)
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
        .eq('user_id', authUser.id)
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
        .eq('referrer_id', authUser.id)
        .order('registered_at', { ascending: false });

      if (refData) {
        this.userReferrals = refData.map((r) => ({
          id: r.id,
          referrer_id: r.referrer_id,
          referred_user_id: r.referred_user_id,
          referred_name: r.referred_name || 'مستثمر',
          referral_code: meta.referral_code || '',
          registered_at: r.registered_at,
          status: r.status as 'registered' | 'qualified',
          invested_amount: Number(r.invested_amount || 0),
        }));
      }

      // 6. Fetch Daily Cycle
      const { data: cycleData } = await supabase
        .from('daily_cycles')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cycleData) {
        const startMs = new Date(cycleData.started_at).getTime();
        const endMs = new Date(cycleData.ends_at).getTime();
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
        const now = Date.now();
        this.userCycle = {
          id: 'cyc_' + authUser.id,
          user_id: authUser.id,
          cycle_duration_seconds: 24 * 3600,
          started_at: now,
          ends_at: now + CYCLE_DURATION_MS,
          return_calculated: 0,
          status: 'running',
        };
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }

    this.notify();
  }

  // --- Auth Methods ---
  async loginUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'تعذر الاتصال بخدمة المصادقة.' };
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
      const referralCode = 'ARB' + Math.floor(1000 + Math.random() * 9000);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password || '',
        options: {
          data: {
            first_name: params.first_name.trim(),
            last_name: params.last_name.trim(),
            phone: params.phone.trim(),
            referral_code: referralCode,
            referred_by_code: params.referred_by_code?.trim().toUpperCase() || null,
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

      if (data.session && data.user) {
        await this.handleUserSession(data.user);
        return { success: true, user: this.currentUser || undefined };
      } else if (data.user && !data.session) {
        return {
          success: true,
          requiresEmailConfirmation: true,
          message:
            'تم إنشاء حسابك بنجاح! تم إرسال رابط تأكيد إلى بريدك الإلكتروني، يرجى النقر عليه لتفعيل حسابك ثم تسجيل الدخول.',
        };
      }

      return { success: false, error: 'فشل إتمام التسجيل.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'حدث خطأ أثناء التسجيل.' };
    }
  }

  async logout() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.currentUser = null;
    this.currentProfile = null;
    this.userWallets = [];
    this.userInvestments = [];
    this.userTransactions = [];
    this.userReferrals = [];
    this.userCycle = null;
    this.notify();
  }

  // --- Getters ---
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserProfile(userId?: string): Profile | null {
    return this.currentProfile;
  }

  getLevels(): InvestmentLevel[] {
    return this.levels;
  }

  getPlans(): InvestmentPlan[] {
    return this.plans;
  }

  getPlansForLevel(levelNumber: number): InvestmentPlan[] {
    return this.plans.filter((p) => p.level_id === levelNumber);
  }

  getWallets(userId?: string): CryptoWallet[] {
    return this.userWallets;
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

      // Insert transaction
      const { data: newTx } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount: amount,
          title: `إيداع محفظة ${currency}`,
          description: `إيداع ناجح بقيمة ${amount} ${currency}`,
          status: 'completed',
        })
        .select()
        .maybeSingle();

      // Local optimistic update
      if (wallet) wallet.balance = newWalletBal;
      if (this.currentProfile) this.currentProfile.total_balance = newTotalBal;
      if (newTx) {
        this.userTransactions.unshift({
          id: newTx.id,
          user_id: userId,
          type: 'deposit',
          amount,
          currency: 'USD',
          status: 'completed',
          title: newTx.title,
          description: newTx.description,
          created_at: newTx.created_at,
        });
      }

      this.notify();
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

      // Insert transaction (pending for admin approval / verification)
      const { data: newTx } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          amount: amount,
          title: `طلب سحب ${currency}`,
          description: `طلب سحب إلى العنوان: ${targetAddress}`,
          status: 'pending',
          metadata: { targetAddress, currency },
        })
        .select()
        .maybeSingle();

      // Local state update
      wallet.balance = newWalletBal;
      if (this.currentProfile) this.currentProfile.total_balance = newTotalBal;
      if (newTx) {
        this.userTransactions.unshift({
          id: newTx.id,
          user_id: userId,
          type: 'withdrawal',
          amount,
          currency: 'USD',
          status: 'pending',
          title: newTx.title,
          description: newTx.description,
          created_at: newTx.created_at,
        });
      }

      this.notify();
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

      // 1. Insert Investment
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

      // 2. Update Profile Balance & Invested
      const newTotalBal = this.currentProfile.total_balance - params.amount;
      const newInvested = this.currentProfile.current_invested + params.amount;

      await supabase
        .from('profiles')
        .update({
          total_balance: newTotalBal,
          current_invested: newInvested,
        })
        .eq('id', params.userId);

      // 3. Insert Transaction
      const { data: txRow } = await supabase
        .from('transactions')
        .insert({
          user_id: params.userId,
          type: 'investment',
          amount: params.amount,
          title: `استثمار جديد - Level ${params.levelId}`,
          description: `مبلغ $${params.amount} بعائد يومي متوقع $${params.expectedDailyReturn}`,
          status: 'completed',
        })
        .select()
        .maybeSingle();

      // 4. Update local state
      this.currentProfile.total_balance = newTotalBal;
      this.currentProfile.current_invested = newInvested;

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

      this.userInvestments.unshift(createdInvestment);

      if (txRow) {
        this.userTransactions.unshift({
          id: txRow.id,
          user_id: params.userId,
          type: 'investment',
          amount: params.amount,
          currency: 'USD',
          status: 'completed',
          title: txRow.title,
          description: txRow.description,
          created_at: txRow.created_at,
        });
      }

      this.notify();
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

    if (totalDailyReturn <= 0 || !this.currentProfile) {
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

      // Record transaction
      const { data: txRow } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'return',
          amount: totalDailyReturn,
          title: 'عائد الدورة اليومية المكتملة',
          description: `تم إضافة العائد اليومي بقيمة $${totalDailyReturn.toFixed(2)} بنجاح إلى رصيدك.`,
          status: 'completed',
        })
        .select()
        .maybeSingle();

      // Reset local cycle
      const now = Date.now();
      this.userCycle = {
        id: 'cyc_' + now,
        user_id: userId,
        cycle_duration_seconds: 24 * 3600,
        started_at: now,
        ends_at: now + CYCLE_DURATION_MS,
        return_calculated: totalDailyReturn,
        status: 'running',
      };

      this.currentProfile.total_balance = newTotalBal;
      this.currentProfile.total_profits = newProfits;

      if (txRow) {
        this.userTransactions.unshift({
          id: txRow.id,
          user_id: userId,
          type: 'return',
          amount: totalDailyReturn,
          currency: 'USD',
          status: 'completed',
          title: txRow.title,
          description: txRow.description,
          created_at: txRow.created_at,
        });
      }

      this.notify();
      return { returnedAmount: totalDailyReturn };
    } catch (e) {
      console.error('Cycle completion error:', e);
      return { returnedAmount: 0 };
    }
  }

  // --- Real Admin queries for `/secure-admin` ---
  async checkIsAdmin(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return false;

      // Check admin emails or metadata
      const adminEmails = ['wahablila31000@gmail.com', 'admin@invest-profit.com'];
      if (adminEmails.includes(user.email || '')) return true;

      if (
        user.app_metadata?.role === 'admin' ||
        user.user_metadata?.role === 'admin'
      ) {
        return true;
      }

      // Check profile role if available
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
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', txId);
    return { success: !error };
  }

  async toggleLevelUnlockForAdmin(
    levelId: number,
    isUnlocked: boolean
  ): Promise<{ success: boolean }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false };
    const { error } = await supabase
      .from('investment_levels')
      .update({ is_unlocked: isUnlocked })
      .eq('id', levelId);
    if (!error) {
      await this.fetchLevelsAndPlans();
    }
    return { success: !error };
  }
}

export const db = new DatabaseService();
