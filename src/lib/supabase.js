import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Bisa null saat env belum diisi (build Track-A only). Konsumen wajib cek `isSupabaseReady`.
export const isSupabaseReady = Boolean(url && anon)
export const supabase = isSupabaseReady ? createClient(url, anon) : null
