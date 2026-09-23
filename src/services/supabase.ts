import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as sharedClient, getSupabase as getSharedClient, SUPABASE_URL, SUPABASE_ANON_KEY } from './storage';

// Configuration keys
const STORAGE_URL_KEY = 'invest_app_supabase_url';
const STORAGE_KEY_KEY = 'invest_app_supabase_key';

// Check environment variables first, then localStorage
export const getSupabaseConfig = () => {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('https://')),
  };
};

export const getSupabase = (): SupabaseClient | null => {
  return getSharedClient();
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
  else localStorage.removeItem(STORAGE_URL_KEY);

  if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);
};

export const testSupabaseConnection = async (testUrl?: string, testKey?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const url = testUrl || getSupabaseConfig().url;
    const key = testKey || getSupabaseConfig().key;

    if (!url || !key) {
      return { success: false, message: 'يرجى إدخال عنوان URL ومفتاح Anon Key الخاص بـ Supabase.' };
    }

    const testClient = createClient(url, key);
    const { error } = await testClient.from('investment_levels').select('count').limit(1);

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

