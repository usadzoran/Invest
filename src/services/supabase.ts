import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys
const STORAGE_URL_KEY = 'invest_app_supabase_url';
const STORAGE_KEY_KEY = 'invest_app_supabase_key';

// Check environment variables first, then localStorage
export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem(STORAGE_URL_KEY);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = localUrl || (envUrl && envUrl !== 'https://your-project.supabase.co' ? envUrl : '');
  const key = localKey || (envKey && envKey !== 'your-anon-public-key' ? envKey : '');

  return {
    url: url || '',
    key: key || '',
    isConfigured: Boolean(url && key && url.startsWith('https://')),
  };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }

  return clientInstance;
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
  else localStorage.removeItem(STORAGE_URL_KEY);

  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);

  clientInstance = null; // Reset instance to recreate with new credentials
};

export const testSupabaseConnection = async (testUrl?: string, testKey?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const url = testUrl || getSupabaseConfig().url;
    const key = testKey || getSupabaseConfig().key;

    if (!url || !key) {
      return { success: false, message: 'يرجى إدخال عنوان URL ومفتاح Anon Key الخاص بـ Supabase.' };
    }

    const testClient = createClient(url, key);
    const { data, error } = await testClient.from('investment_levels').select('count').limit(1);

    if (error) {
      // If table doesn't exist yet, it's connected to Supabase but needs SQL script
      if (error.code === '42P01' || error.message?.includes('relation "public.investment_levels" does not exist')) {
        return {
          success: true,
          message: 'تم الاتصال بـ Supabase بنجاح! يرجى تشغيل سكربت إنشاء الجداول (SQL Schema) في لوحة التحكم.',
        };
      }
      return { success: false, message: `خطأ في الاتصال: ${error.message}` };
    }

    return { success: true, message: '✅ تم الاتصال بقاعدة بيانات Supabase بنجاح والجداول جاهزة!' };
  } catch (err: any) {
    return { success: false, message: `فشل الاتصال: ${err?.message || 'خطأ غير معروف'}` };
  }
};
