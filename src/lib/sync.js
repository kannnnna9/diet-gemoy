// Pintu tunggal store <-> Supabase.
// Migrasi ke Supabase-primary (Fase 3) = ganti isi fungsi di file ini saja; konsumen tak berubah.
import { supabase, isSupabaseReady } from './supabase'
import { get, set } from './storage'

// Rekonsiliasi last-write-wins (fungsi murni, ditest tanpa jaringan).
export function pilihLww(lokal, cloud) {
  if (!lokal) return cloud
  if (!cloud) return lokal
  return new Date(cloud.updated_at) > new Date(lokal.updated_at) ? cloud : lokal
}

let _userId = null
let _profilId = null
let _syncListenerPasang = false
const antrean = []

export function initSync(userId, profilId) {
  _userId = userId
  _profilId = profilId
  if (_syncListenerPasang) return
  _syncListenerPasang = true
  window.addEventListener('online', flush)
}

export async function push(jenis, tanggal, payload) {
  if (!isSupabaseReady || !_userId) return
  const row = {
    user_id: _userId,
    profil_id: _profilId,
    jenis,
    tanggal,
    payload,
    updated_at: new Date().toISOString(),
  }
  if (!navigator.onLine) {
    antrean.push(row)
    set('_global', 'syncQueue', antrean)
    return
  }
  await supabase.from('tracking').upsert(row, { onConflict: 'user_id,jenis,tanggal' })
}

async function flush() {
  if (!isSupabaseReady || !navigator.onLine) return
  const q = get('_global', 'syncQueue', [])
  for (const row of q) {
    await supabase.from('tracking').upsert(row, { onConflict: 'user_id,jenis,tanggal' })
  }
  set('_global', 'syncQueue', [])
  antrean.length = 0
}

// Tarik data user, rekonsiliasi LWW ke localStorage lewat callback penulis.
export async function pullMine(tulisLokal) {
  if (!isSupabaseReady || !_userId) return
  const { data } = await supabase.from('tracking').select('*').eq('user_id', _userId)
  for (const cloud of data || []) {
    const kunciLokal = cloud.jenis === 'checklist' ? `checklist:${cloud.tanggal}` : cloud.jenis
    tulisLokal(cloud, kunciLokal)
  }
}

// Tarik data pasangan (read-only) ke cache terpisah `partner:*`.
export async function pullPartner(pasanganUserId) {
  if (!isSupabaseReady || !pasanganUserId) return []
  const { data } = await supabase.from('tracking').select('*').eq('user_id', pasanganUserId)
  set('_global', 'partnerCache', data || [])
  return data || []
}
