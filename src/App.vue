<template>
  <AppShell>
    <router-view />
  </AppShell>
</template>

<script setup>
import { watchEffect } from 'vue'
import AppShell from './components/AppShell.vue'
import { useProfileStore } from './stores/profile'

const profile = useProfileStore()

// Tema ikut profil aktif: ganti profil → seluruh app re-tema tanpa reload.
watchEffect(() => {
  document.documentElement.dataset.theme = profile.profilAktif
})
</script>
