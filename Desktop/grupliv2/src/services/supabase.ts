import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

function env(name: string) {
  return (globalThis as any)?.process?.env?.[name] || '';
}

const supabaseUrl = env('EXPO_PUBLIC_SUPABASE_URL');
const supabaseKey = env('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || env('EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('tu-proyecto'));

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web'
      }
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error('Faltan las variables EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  return supabase;
}
