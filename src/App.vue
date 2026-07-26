<template>
  <AppShell v-if="!isLoginRoute">
    <router-view />
  </AppShell>
  <router-view v-else />
</template>

<script setup>
import { onMounted, watchEffect, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from './components/AppShell.vue'
import { useProfileStore } from './stores/profile'
import { useAuthStore } from './stores/auth'
import { perluKeBeranda, perluKeLogin } from './lib/authNav'

const route = useRoute()
const router = useRouter()
const profile = useProfileStore()
const auth = useAuthStore()

const isLoginRoute = computed(() => route.name === 'login')

onMounted(() => auth.init())

// Sesi OAuth selesai secara async (setelah kembali dari Google). Begitu profil terisi
// sementara kita masih di layar login, pindah ke beranda — guard tak menangkap
// perubahan auth yang datang setelah ia memutuskan.
watch(() => auth.profilId, (id) => {
  if (perluKeBeranda(id, route.name)) router.replace({ name: 'beranda' })
  else if (perluKeLogin(id, route.name)) router.replace({ name: 'login' })
})

// Tema html ikut profil aktif untuk mode app. Layar login pakai tema sendiri (scoped).
watchEffect(() => {
  document.documentElement.dataset.theme = profile.profilAktif
})
</script>
