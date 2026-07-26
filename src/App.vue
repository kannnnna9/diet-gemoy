<template>
  <AppShell v-if="!isLoginRoute">
    <router-view />
  </AppShell>
  <router-view v-else />
</template>

<script setup>
import { onMounted, watchEffect, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'
import { useProfileStore } from './stores/profile'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const profile = useProfileStore()
const auth = useAuthStore()

const isLoginRoute = computed(() => route.name === 'login')

onMounted(() => auth.init())

// Tema html ikut profil aktif untuk mode app. Layar login pakai tema sendiri (scoped).
watchEffect(() => {
  document.documentElement.dataset.theme = profile.profilAktif
})
</script>
