<template>
  <SplashLoading v-if="!authSiap" />
  <AppShell v-else-if="!isLoginRoute">
    <router-view />
  </AppShell>
  <router-view v-else />
</template>

<script setup>
import { onMounted, watch, watchEffect, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from './components/AppShell.vue'
import SplashLoading from './components/SplashLoading.vue'
import { isSupabaseReady } from './lib/supabase'
import { useProfileStore } from './stores/profile'
import { useAuthStore } from './stores/auth'
import { perluKeLogin, tujuanSetelahLogin } from './lib/authNav'

const route = useRoute()
const router = useRouter()
const profile = useProfileStore()
const auth = useAuthStore()

const isLoginRoute = computed(() => route.name === 'login')
const authSiap = computed(() => !isSupabaseReady || auth.siap)

// Rute yang dikenal untuk validasi redirect (semua kecuali login).
const ruteDikenal = router.getRoutes()
  .filter(r => r.name !== 'login')
  .map(r => r.path)

onMounted(() => auth.init())

// Sesi OAuth selesai secara async (setelah kembali dari Google). Begitu profil terisi
// sementara kita masih di layar login, pindah ke halaman asal (redirect) atau beranda.
// Guard tak menangkap perubahan auth yang datang setelah ia memutuskan.
watch(() => auth.profilId, (id) => {
  if (id) {
    const tujuan = tujuanSetelahLogin(route.name, route.query.redirect, ruteDikenal)
    if (tujuan) router.replace(tujuan)
  } else if (perluKeLogin(id, route.name)) {
    router.replace({ name: 'login' })
  }
})

// Tema html ikut profil aktif untuk mode app. Layar login pakai tema sendiri (scoped).
watchEffect(() => {
  document.documentElement.dataset.theme = profile.profilAktif
})
</script>
