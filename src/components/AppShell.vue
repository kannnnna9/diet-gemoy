<template>
  <div class="shell">
    <header class="shell-header">
      <span class="shell-title">Diet Gemoy</span>
      <ProfileSwitch v-if="!isSupabaseReady" />
    </header>
    <main class="shell-main">
      <slot />
    </main>
    <nav class="shell-nav">
      <button
        v-for="item in navItems"
        :key="item.to"
        class="nav-btn"
        :class="{ active: route.path === item.to }"
        @click="navigate(item.to)"
      >
        <component :is="item.icon" :size="20" />
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Home, BookOpen, PencilLine, TrendingUp, Settings } from 'lucide-vue-next'
import ProfileSwitch from './ProfileSwitch.vue'
import { isSupabaseReady } from '../lib/supabase'

const route = useRoute()
const router = useRouter()

const navItems = [
  { to: '/', icon: Home, label: 'Hari Ini' },
  { to: '/program', icon: BookOpen, label: 'Program' },
  { to: '/catat', icon: PencilLine, label: 'Catat' },
  { to: '/progres', icon: TrendingUp, label: 'Progres' },
  { to: '/pengaturan', icon: Settings, label: 'Atur' },
]

function navigate(to) {
  if (route.path !== to) router.push(to)
}
</script>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 10;
}

.shell-title {
  font-family: var(--font-head);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
}

.shell-main {
  flex: 1;
}

.shell-nav {
  display: flex;
  background: var(--surface);
  border-top: 1px solid var(--line);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 4px 0;
  padding-bottom: env(safe-area-inset-bottom, 4px);
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  color: var(--text-muted);
  transition: color .15s;
}

.nav-btn.active {
  color: var(--primary);
}

.nav-label {
  font-size: .6875rem;
  font-weight: 600;
}
</style>
