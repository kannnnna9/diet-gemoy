<template>
  <AppShell>
    <router-view />
  </AppShell>
</template>

<script setup>
import { onMounted, watchEffect } from 'vue'
import AppShell from './components/AppShell.vue'
import { useProfileStore } from './stores/profile'
import { useAuthStore } from './stores/auth'

const profile = useProfileStore()
const auth = useAuthStore()

onMounted(() => auth.init())

// Tema ikut profil aktif: ganti profil → seluruh app re-tema tanpa reload.
watchEffect(() => {
  document.documentElement.dataset.theme = profile.profilAktif
})
</script>
