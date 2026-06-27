import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'pronostico-auth-token',
  },
})

// Config constants
export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234'
export const MATCH_DEADLINE = new Date(import.meta.env.VITE_MATCH_DEADLINE || '2026-06-28T20:00:00Z')
export const MATCH_SLUG = 'colombia-vs-portugal-2026'
