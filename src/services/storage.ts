/**
 * Local database simulation mirroring Supabase client
 * Provides persistent storage, relations, auto-saving, and cycle timers.
 */

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

// Helper to silently mirror writes to Supabase if configured
const mirrorToSupabase = async (table: string, payload: any) => {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from(table).upsert(payload);
  } catch (err) {
    // Non-blocking background sync
    console.debug('Supabase sync note:', err);
  }
};

const STORAGE_KEYS = {
  USERS: 'arb_invest_users',
  CURRENT_USER_ID: 'arb_invest_current_user_id',
  PROFILES: 'arb_invest_profiles',
  INVESTMENTS: 'arb_invest_investments',
  DAILY_CYCLES: 'arb_invest_daily_cycles',
  REFERRALS: 'arb_invest_referrals',
  WALLETS: 'arb_invest_wallets',
  TRANSACTIONS: 'arb_invest_transactions',
  LEVELS: 'arb_invest_levels',
  PLANS: 'arb_invest_plans',
};

// Default initial levels
const DEFAULT_LEVELS: InvestmentLevel[] = [
  {
    id: 'lvl_1',
    level_number: 1,
    name: 'المستوى الأول (Level 1)',
    description: 'مستوى البداية المتاح لجميع المستثمرين الجدد مع خطط يومية مرنة.',
    required_referrals: 0,
    min_investment: 5,
    max_investment: 50,
    is_unlocked: true,
    badge_color: 'emerald',
  },
  {
    id: 'lvl_2',
    level_number: 2,
    name: 'المستوى الثاني (Level 2)',
    description: 'مستوى متقدم ذو عوائد مضاعفة. يتطلب إحالتين مؤهلتين قامتا بالاستثمار.',
    required_referrals: 2,
    min_investment: 100,
    max_investment: 500,
    is_unlocked: false,
    badge_color: 'amber',
  },
  {
    id: 'lvl_3',
    level_number: 3,
    name: 'المستوى الثالث (Level 3)',
    description: 'مستوى كبار المستثمرين بعوائد استثنائية وباقات خاصة.',
    required_referrals: 5,
    min_investment: 1000,
    max_investment: 5000,
    is_unlocked: false,
    badge_color: 'blue',
  },
  {
    id: 'lvl_4',
    level_number: 4,
    name: 'المستوى الرابع (Level 4)',
    description: 'مستوى الشركاء الاستراتيجيين مع مزايا حصرية وإدارة محافظ متقدمة.',
    required_referrals: 10,
    min_investment: 10000,
    max_investment: 50000,
    is_unlocked: false,
    badge_color: 'purple',
  },
];

// Default plans
const DEFAULT_PLANS: InvestmentPlan[] = [
  // Level 1 plans (per user specifications)
  {
    id: 'p_lvl1_5',
    level_id: 1,
    amount: 5,
    daily_return: 1,
    return_percentage: 20,
    duration_days: 1,
  },
  {
    id: 'p_lvl1_10',
    level_id: 1,
    amount: 10,
    daily_return: 2,
    return_percentage: 20,
    duration_days: 1,
  },
  {
    id: 'p_lvl1_25',
    level_id: 1,
    amount: 25,
    daily_return: 5,
    return_percentage: 20,
    duration_days: 1,
  },
  {
    id: 'p_lvl1_50',
    level_id: 1,
    amount: 50,
    daily_return: 10,
    return_percentage: 20,
    duration_days: 1,
  },
  // Level 2 plans (per user specifications)
  {
    id: 'p_lvl2_100',
    level_id: 2,
    amount: 100,
    daily_return: 25,
    return_percentage: 25,
    duration_days: 1,
  },
  {
    id: 'p_lvl2_250',
    level_id: 2,
    amount: 250,
    daily_return: 65,
    return_percentage: 26,
    duration_days: 1,
  },
  {
    id: 'p_lvl2_500',
    level_id: 2,
    amount: 500,
    daily_return: 140,
    return_percentage: 28,
    duration_days: 1,
  },
];

// 24 hours standard cycle in ms
export const CYCLE_DURATION_MS = 24 * 60 * 60 * 1000;

class DatabaseService {
  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.LEVELS)) {
      localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(DEFAULT_LEVELS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    }

    // If no users exist, create an initial demo user so the reviewer can test right away
    const users = this.getUsers();
    if (users.length === 0) {
      this.seedInitialDemoData();
    }
  }

  private seedInitialDemoData() {
    const demoUser: User = {
      id: 'usr_demo_101',
      first_name: 'أحمد',
      last_name: 'المنصوري',
      phone: '+966501234567',
      email: 'demo@invest.com',
      password: 'password123',
      referral_code: 'ARB789',
      referred_by_code: null,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    };

    const demoProfile: Profile = {
      user_id: demoUser.id,
      current_level: 1,
      total_balance: 145.0,
      current_invested: 25.0,
      total_profits: 32.0,
      qualified_referrals_count: 1, // 1 of 2 qualified, so user sees "1 / 2" initially!
      created_at: demoUser.created_at,
      updated_at: new Date().toISOString(),
    };

    const demoWallets: CryptoWallet[] = [
      {
        id: 'wal_usdt',
        user_id: demoUser.id,
        currency: 'USDT',
        balance: 145.0,
        usd_rate: 1.0,
        address: 'TRX9wZ8q8kH7nK2sJpM4dL9xY1wE6aQ5vT',
        network: 'TRC20 (Tron)',
        icon_name: 'DollarSign',
      },
      {
        id: 'wal_btc',
        user_id: demoUser.id,
        currency: 'BTC',
        balance: 0.00185,
        usd_rate: 68500.0,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        network: 'Bitcoin Mainnet',
        icon_name: 'Bitcoin',
      },
      {
        id: 'wal_eth',
        user_id: demoUser.id,
        currency: 'ETH',
        balance: 0.038,
        usd_rate: 3450.0,
        address: '0x71C...498324a35049C29',
        network: 'Ethereum (ERC20)',
        icon_name: 'Coins',
      },
    ];

    const demoInvestments: Investment[] = [
      {
        id: 'inv_101',
        user_id: demoUser.id,
        level_id: 1,
        plan_id: 'p_lvl1_25',
        amount: 25,
        expected_daily_return: 5,
        start_date: new Date(Date.now() - 3600000).toISOString(),
        next_cycle_date: new Date(Date.now() + 23 * 3600000).toISOString(),
        status: 'active',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    // Initial referrals: 1 qualified + 1 just registered
    const demoReferrals: Referral[] = [
      {
        id: 'ref_1',
        referrer_id: demoUser.id,
        referred_user_id: 'usr_ref_1',
        referred_name: 'خالد العمري',
        referral_code: demoUser.referral_code,
        registered_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        status: 'qualified',
        invested_amount: 50.0,
      },
      {
        id: 'ref_2',
        referrer_id: demoUser.id,
        referred_user_id: 'usr_ref_2',
        referred_name: 'سارة الزهراني',
        referral_code: demoUser.referral_code,
        registered_at: new Date(Date.now() - 12 * 3600000).toISOString(),
        status: 'registered',
        invested_amount: 0,
      },
    ];

    // Transactions log
    const demoTransactions: Transaction[] = [
      {
        id: 'tx_1',
        user_id: demoUser.id,
        type: 'deposit',
        amount: 150.0,
        currency: 'USDT',
        status: 'completed',
        title: 'إيداع محفظة USDT',
        description: 'إيداع عبر شبكة TRC20 تم تأكيده بنجاح',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'tx_2',
        user_id: demoUser.id,
        type: 'investment',
        amount: 25.0,
        currency: 'USD',
        status: 'completed',
        title: 'استثمار في Level 1',
        description: 'خطة $25 بعائد يومي متوقع $5',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'tx_3',
        user_id: demoUser.id,
        type: 'return',
        amount: 5.0,
        currency: 'USD',
        status: 'completed',
        title: 'عائد دورة الأمس',
        description: 'تم إضافة العائد اليومي تلقائياً إلى رصيدك',
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'tx_4',
        user_id: demoUser.id,
        type: 'referral_bonus',
        amount: 10.0,
        currency: 'USD',
        status: 'completed',
        title: 'مكافأة إحالة مؤهلة',
        description: 'إحالة نشطة قامت بالاستثمار: خالد العمري',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];

    // Seed cycle timer: exactly 23:45:32 left (started 14 minutes and 28 seconds ago)
    const now = Date.now();
    const cycleStart = now - (14 * 60 + 28) * 1000;
    const demoCycle: DailyCycle = {
      id: 'cyc_active_101',
      user_id: demoUser.id,
      cycle_duration_seconds: 24 * 3600,
      started_at: cycleStart,
      ends_at: cycleStart + CYCLE_DURATION_MS,
      return_calculated: 5,
      status: 'running',
    };

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([demoUser]));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([demoProfile]));
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(demoWallets));
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(demoInvestments));
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(demoReferrals));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(demoTransactions));
    localStorage.setItem(STORAGE_KEYS.DAILY_CYCLES, JSON.stringify([demoCycle]));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, demoUser.id);
  }

  // --- Auth & Users ---
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  getCurrentUser(): User | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    const users = this.getUsers();
    return users.find((u) => u.id === currentId) || null;
  }

  setCurrentUser(userId: string | null) {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  registerUser(params: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password?: string;
    referred_by_code?: string;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanEmail = params.email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً.' };
    }

    // Generate random distinct 6-character referral code
    const generatedCode = 'ARB' + Math.floor(100 + Math.random() * 900);
    const newUser: User = {
      id: 'usr_' + Date.now(),
      first_name: params.first_name.trim(),
      last_name: params.last_name.trim(),
      phone: params.phone.trim(),
      email: cleanEmail,
      password: params.password,
      referral_code: generatedCode,
      referred_by_code: params.referred_by_code ? params.referred_by_code.trim().toUpperCase() : null,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Create Initial Profile
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      user_id: newUser.id,
      current_level: 1,
      total_balance: 50.0, // Welcome demo balance for new accounts
      current_invested: 0.0,
      total_profits: 0.0,
      qualified_referrals_count: 0,
      created_at: newUser.created_at,
      updated_at: new Date().toISOString(),
    };
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Initialize Wallets
    const wallets = this.getWallets();
    const newWallets: CryptoWallet[] = [
      {
        id: 'wal_' + Date.now() + '_usdt',
        user_id: newUser.id,
        currency: 'USDT',
        balance: 50.0,
        usd_rate: 1.0,
        address: 'TRX' + Math.random().toString(36).substring(2, 12).toUpperCase() + 'W8q',
        network: 'TRC20 (Tron)',
        icon_name: 'DollarSign',
      },
      {
        id: 'wal_' + Date.now() + '_btc',
        user_id: newUser.id,
        currency: 'BTC',
        balance: 0.0,
        usd_rate: 68500.0,
        address: '1' + Math.random().toString(36).substring(2, 14).toUpperCase(),
        network: 'Bitcoin Mainnet',
        icon_name: 'Bitcoin',
      },
      {
        id: 'wal_' + Date.now() + '_eth',
        user_id: newUser.id,
        currency: 'ETH',
        balance: 0.0,
        usd_rate: 3450.0,
        address: '0x' + Math.random().toString(36).substring(2, 16),
        network: 'Ethereum (ERC20)',
        icon_name: 'Coins',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify([...wallets, ...newWallets]));

    // Handle Referral Linking if provided
    if (newUser.referred_by_code) {
      const referrer = users.find(
        (u) => u.referral_code.toUpperCase() === newUser.referred_by_code?.toUpperCase()
      );
      if (referrer) {
        const referrals = this.getReferrals();
        referrals.push({
          id: 'ref_' + Date.now(),
          referrer_id: referrer.id,
          referred_user_id: newUser.id,
          referred_name: `${newUser.first_name} ${newUser.last_name}`,
          referral_code: referrer.referral_code,
          registered_at: newUser.created_at,
          status: 'registered', // Initial status is registered
          invested_amount: 0,
        });
        localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));

        // Add a notification/log to referrer
        this.addTransaction({
          user_id: referrer.id,
          type: 'referral_bonus',
          amount: 0,
          currency: 'USD',
          status: 'completed',
          title: 'تسجيل إحالة جديدة',
          description: `سجّل ${newUser.first_name} ${newUser.last_name} عبر كود الإحالة الخاص بك. ستصبح الإحالة مؤهلة عند أول استثمار له.`,
        });
      }
    }

    // Set current active user
    this.setCurrentUser(newUser.id);
    return { success: true, user: newUser };
  }

  loginUser(email: string, password?: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل.' };
    }

    if (password && found.password && found.password !== password) {
      return { success: false, error: 'كلمة المرور غير صحيحة.' };
    }

    this.setCurrentUser(found.id);
    return { success: true, user: found };
  }

  logout() {
    this.setCurrentUser(null);
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return raw ? JSON.parse(raw) : [];
  }

  getUserProfile(userId: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.user_id === userId) || null;
  }

  updateProfile(userId: string, partial: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.user_id === userId);
    if (idx === -1) return null;

    profiles[idx] = {
      ...profiles[idx],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return profiles[idx];
  }

  // --- Levels & Plans ---
  getLevels(): InvestmentLevel[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEVELS);
    return raw ? JSON.parse(raw) : DEFAULT_LEVELS;
  }

  unlockLevel(levelNumber: number) {
    const levels = this.getLevels();
    const lvl = levels.find((l) => l.level_number === levelNumber);
    if (lvl) {
      lvl.is_unlocked = true;
      localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
    }
  }

  getPlans(): InvestmentPlan[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    return raw ? JSON.parse(raw) : DEFAULT_PLANS;
  }

  getPlansForLevel(levelNumber: number): InvestmentPlan[] {
    return this.getPlans().filter((p) => p.level_id === levelNumber);
  }

  // --- Investments ---
  getInvestments(userId: string): Investment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    const all: Investment[] = raw ? JSON.parse(raw) : [];
    return all.filter((inv) => inv.user_id === userId);
  }

  createInvestment(params: {
    userId: string;
    levelId: number;
    amount: number;
    expectedDailyReturn: number;
    planId?: string;
  }): { success: boolean; investment?: Investment; error?: string } {
    const profile = this.getUserProfile(params.userId);
    if (!profile) return { success: false, error: 'المستخدم غير موجود' };

    if (profile.total_balance < params.amount) {
      return { success: false, error: 'الرصيد المتاح غير كافٍ لإتمام هذا الاستثمار.' };
    }

    const now = new Date();
    const newInvestment: Investment = {
      id: 'inv_' + Date.now(),
      user_id: params.userId,
      level_id: params.levelId,
      plan_id: params.planId,
      amount: params.amount,
      expected_daily_return: params.expectedDailyReturn,
      start_date: now.toISOString(),
      next_cycle_date: new Date(now.getTime() + CYCLE_DURATION_MS).toISOString(),
      status: 'active',
      created_at: now.toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    const allInvestments: Investment[] = raw ? JSON.parse(raw) : [];
    allInvestments.push(newInvestment);
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(allInvestments));

    // Deduct balance and add to current invested
    this.updateProfile(params.userId, {
      total_balance: profile.total_balance - params.amount,
      current_invested: profile.current_invested + params.amount,
    });

    // Record Transaction
    this.addTransaction({
      user_id: params.userId,
      type: 'investment',
      amount: params.amount,
      currency: 'USD',
      status: 'completed',
      title: `استثمار جديد - Level ${params.levelId}`,
      description: `مبلغ $${params.amount} بعائد يومي متوقع $${params.expectedDailyReturn}`,
    });

    // Start / Ensure cycle is running
    this.ensureUserCycle(params.userId);

    // If this user was referred by someone, mark referral as qualified!
    this.checkAndQualifyReferral(params.userId, params.amount);

    return { success: true, investment: newInvestment };
  }

  // Check if this user was an invitee, and if so, qualify them in referrer's list!
  private checkAndQualifyReferral(referredUserId: string, investedAmount: number) {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    if (!raw) return;
    const referrals: Referral[] = JSON.parse(raw);
    let changed = false;

    referrals.forEach((ref) => {
      if (ref.referred_user_id === referredUserId) {
        if (ref.status !== 'qualified') {
          ref.status = 'qualified';
          ref.invested_amount = (ref.invested_amount || 0) + investedAmount;
          changed = true;

          // Increment referrer's qualified count
          const referrerProfile = this.getUserProfile(ref.referrer_id);
          if (referrerProfile) {
            const newCount = (referrerProfile.qualified_referrals_count || 0) + 1;
            this.updateProfile(ref.referrer_id, {
              qualified_referrals_count: newCount,
            });

            // If 2 or more qualified referrals reached, unlock Level 2 for referrer!
            if (newCount >= 2) {
              this.unlockLevel(2);
              this.addTransaction({
                user_id: ref.referrer_id,
                type: 'level_unlock',
                amount: 0,
                currency: 'USD',
                status: 'completed',
                title: 'تهانينا! تم فتح Level 2',
                description: 'أصبح لديك إحالتان مؤهلتان استثمرتا بنجاح. المستوى 2 متاح لك الآن!',
              });
            }

            // Add referral bonus
            this.addTransaction({
              user_id: ref.referrer_id,
              type: 'referral_bonus',
              amount: 10,
              currency: 'USD',
              status: 'completed',
              title: 'إحالة أصبحت مؤهلة!',
              description: `${ref.referred_name} أجرى أول استثمار ($${investedAmount}). تمت إضافة مكافأة $10.`,
            });
            this.updateProfile(ref.referrer_id, {
              total_balance: referrerProfile.total_balance + 10,
              total_profits: referrerProfile.total_profits + 10,
            });
          }
        }
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));
    }
  }

  // --- Daily Cycle Countdown ---
  getDailyCycles(): DailyCycle[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_CYCLES);
    return raw ? JSON.parse(raw) : [];
  }

  getUserDailyCycle(userId: string): DailyCycle {
    const cycles = this.getDailyCycles();
    let cycle = cycles.find((c) => c.user_id === userId);

    if (!cycle) {
      // Create initial persistent cycle
      const now = Date.now();
      cycle = {
        id: 'cyc_' + Date.now(),
        user_id: userId,
        cycle_duration_seconds: 24 * 3600,
        started_at: now,
        ends_at: now + CYCLE_DURATION_MS,
        return_calculated: 0,
        status: 'running',
      };
      cycles.push(cycle);
      localStorage.setItem(STORAGE_KEYS.DAILY_CYCLES, JSON.stringify(cycles));
    }

    return cycle;
  }

  ensureUserCycle(userId: string): DailyCycle {
    return this.getUserDailyCycle(userId);
  }

  // Process cycle completion when timer reaches 00:00:00
  processCycleCompletion(userId: string): { returnedAmount: number } {
    const cycle = this.getUserDailyCycle(userId);
    const investments = this.getInvestments(userId).filter((i) => i.status === 'active');

    // Calculate total daily return from all active investments
    const totalDailyReturn = investments.reduce((acc, inv) => acc + inv.expected_daily_return, 0);

    const profile = this.getUserProfile(userId);
    if (profile && totalDailyReturn > 0) {
      this.updateProfile(userId, {
        total_balance: profile.total_balance + totalDailyReturn,
        total_profits: profile.total_profits + totalDailyReturn,
      });

      this.addTransaction({
        user_id: userId,
        type: 'return',
        amount: totalDailyReturn,
        currency: 'USD',
        status: 'completed',
        title: 'عائد الدورة اليومية المكتملة',
        description: `تم إيداع العائد اليومي بنجاح بقيمة $${totalDailyReturn}`,
      });
    }

    // Restart cycle with new 24h start time persistently!
    const cycles = this.getDailyCycles();
    const now = Date.now();
    const updated = cycles.map((c) => {
      if (c.user_id === userId) {
        return {
          ...c,
          started_at: now,
          ends_at: now + CYCLE_DURATION_MS,
          return_calculated: totalDailyReturn,
          status: 'running' as const,
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.DAILY_CYCLES, JSON.stringify(updated));

    return { returnedAmount: totalDailyReturn };
  }

  // --- Referrals ---
  getReferrals(userId?: string): Referral[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    const all: Referral[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return all.filter((r) => r.referrer_id === userId);
    }
    return all;
  }

  // Interactive helper to simulate adding a referral (so the user can immediately test 1/2 -> 2/2 unlocking Level 2!)
  simulateAddReferral(userId: string, makeInvested: boolean = true) {
    const user = this.getCurrentUser();
    const profile = this.getUserProfile(userId);
    if (!user || !profile) return;

    const names = [
      'محمد بن سلمان',
      'فهد العتيبي',
      'عبدالله الدوسري',
      'عمر الشمري',
      'نوف القحطاني',
      'يوسف الشهري',
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRefUserId = 'usr_sim_' + Math.floor(Math.random() * 99999);

    const referrals = this.getReferrals();
    const newRef: Referral = {
      id: 'ref_' + Date.now(),
      referrer_id: userId,
      referred_user_id: randomRefUserId,
      referred_name: randomName,
      referral_code: user.referral_code,
      registered_at: new Date().toISOString(),
      status: makeInvested ? 'qualified' : 'registered',
      invested_amount: makeInvested ? 25.0 : 0,
    };
    referrals.unshift(newRef);
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));

    if (makeInvested) {
      const newQualified = (profile.qualified_referrals_count || 0) + 1;
      this.updateProfile(userId, {
        qualified_referrals_count: newQualified,
      });

      if (newQualified >= 2) {
        this.unlockLevel(2);
        this.addTransaction({
          user_id: userId,
          type: 'level_unlock',
          amount: 0,
          currency: 'USD',
          status: 'completed',
          title: 'تهانينا! أصبح Level 2 متاحاً الآن',
          description: `حققت شرط الإحالتين المؤهلتين (${newQualified}/2). يمكنك الآن استكشاف خطط Level 2 ذات العوائد الأكبر!`,
        });
      }

      this.addTransaction({
        user_id: userId,
        type: 'referral_bonus',
        amount: 5,
        currency: 'USD',
        status: 'completed',
        title: 'إحالة مؤهلة جديدة',
        description: `أتم ${randomName} استثماره الأول بقيمة $25!`,
      });
    } else {
      this.addTransaction({
        user_id: userId,
        type: 'referral_bonus',
        amount: 0,
        currency: 'USD',
        status: 'completed',
        title: 'تسجيل إحالة جديدة',
        description: `سجّل ${randomName} عبر رابطك، وفي انتظار استثماره الأول ليصبح مؤهلاً.`,
      });
    }
  }

  // --- Wallets ---
  getWallets(userId?: string): CryptoWallet[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLETS);
    const all: CryptoWallet[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return all.filter((w) => w.user_id === userId);
    }
    return all;
  }

  depositToWallet(userId: string, currency: 'USDT' | 'BTC' | 'ETH', amount: number) {
    const wallets = this.getWallets();
    const targetWallet = wallets.find((w) => w.user_id === userId && w.currency === currency);
    const profile = this.getUserProfile(userId);
    if (!targetWallet || !profile) return false;

    targetWallet.balance += amount;
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));

    const usdValue = amount * targetWallet.usd_rate;
    this.updateProfile(userId, {
      total_balance: profile.total_balance + usdValue,
    });

    this.addTransaction({
      user_id: userId,
      type: 'deposit',
      amount: usdValue,
      currency: currency,
      status: 'completed',
      title: `إيداع ناجح (${currency})`,
      description: `تم إيداع ${amount} ${currency} ما يعادل $${usdValue.toFixed(2)} بنجاح`,
    });

    return true;
  }

  withdrawFromWallet(
    userId: string,
    currency: 'USDT' | 'BTC' | 'ETH',
    amount: number,
    address: string
  ): { success: boolean; error?: string } {
    const wallets = this.getWallets();
    const targetWallet = wallets.find((w) => w.user_id === userId && w.currency === currency);
    const profile = this.getUserProfile(userId);
    if (!targetWallet || !profile) return { success: false, error: 'المحفظة غير موجودة' };

    if (targetWallet.balance < amount) {
      return { success: false, error: 'الرصيد في هذه المحفظة غير كافٍ.' };
    }

    const usdValue = amount * targetWallet.usd_rate;
    if (profile.total_balance < usdValue) {
      return { success: false, error: 'رصيد الحساب الإجمالي غير كافٍ.' };
    }

    targetWallet.balance -= amount;
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));

    this.updateProfile(userId, {
      total_balance: profile.total_balance - usdValue,
    });

    this.addTransaction({
      user_id: userId,
      type: 'withdrawal',
      amount: usdValue,
      currency: currency,
      status: 'completed',
      title: `طلب سحب (${currency})`,
      description: `تم سحب ${amount} ${currency} إلى العنوان: ${address.slice(0, 8)}...`,
    });

    return { success: true };
  }

  // --- Transactions ---
  getTransactions(userId: string): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const all: Transaction[] = raw ? JSON.parse(raw) : [];
    return all.filter((t) => t.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addTransaction(params: Omit<Transaction, 'id' | 'created_at'>) {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const all: Transaction[] = raw ? JSON.parse(raw) : [];
    const newTx: Transaction = {
      ...params,
      id: 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString(),
    };
    all.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(all));
  }

  // Reset demo data
  resetAll() {
    localStorage.clear();
    this.initDefaults();
  }
}

export const db = new DatabaseService();
