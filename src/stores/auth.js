import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { useProfileStore } from './profile'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profilId = ref(null)
  const pasanganUserId = ref(null)
  const siap = ref(false)
  const ditolak = ref(false)

  let _initPromise = null

  function init() {
    if (_initPromise) return _initPromise
    _initPromise = (async () => {
      if (!isSupabaseReady) { siap.value = true; return }
      const { data } = await supabase.auth.getSession()
      await terapkanSesi(data.session)
      supabase.auth.onAuthStateChange((_e, session) => terapkanSesi(session))
      siap.value = true
    })()
    return _initPromise
  }

  async function terapkanSesi(session) {
    if (!session) {
      user.value = null
      profilId.value = null
      pasanganUserId.value = null
      return
    }
    user.value = session.user
    const { data: prof } = await supabase
      .from('profiles')
      .select('profil_id, pasangan_user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!prof) {
      ditolak.value = true
      profilId.value = null
      return
    }
    ditolak.value = false
    profilId.value = prof.profil_id
    pasanganUserId.value = prof.pasangan_user_id
    useProfileStore().terapkanDariAuth(prof.profil_id)

    // Sync: init sekali + tarik data sendiri & pasangan. Idempoten via flag di sync.initSync.
    const { initSync, pullMine, pullPartner } = await import('../lib/sync')
    initSync(session.user.id, prof.profil_id)
    const { useTrackingStore } = await import('./tracking')
    const t = useTrackingStore()
    await pullMine((cloud) => t.terimaDariCloud(cloud.jenis, cloud.tanggal, cloud.payload, cloud.updated_at))
    await pullPartner(prof.pasangan_user_id)
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href.split('#')[0] },
    })
  }

  async function logout() {
    if (isSupabaseReady) await supabase.auth.signOut()
    user.value = null
    profilId.value = null
    pasanganUserId.value = null
    ditolak.value = false
  }

  return { user, profilId, pasanganUserId, siap, ditolak, init, loginGoogle, logout }
})
