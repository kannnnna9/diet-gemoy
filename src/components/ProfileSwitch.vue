<template>
  <div class="profile-switch">
    <button class="profile-btn" @click="open = !open">
      <span class="profile-name">{{ namaTampil }}</span>
      <span class="profile-chevron" :class="{ up: open }">▾</span>
    </button>
    <div v-if="open" class="profile-dropdown" @click.self="open = false">
      <div class="dropdown-menu">
        <button
          v-for="p in profilList"
          :key="p.id"
          class="dropdown-item"
          :class="{ active: p.id === profile.profilAktif }"
          @click="pilih(p.id)"
        >
          {{ profile.getNama(p.id) || p.namaDefault }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProfileStore } from '../stores/profile'

const profile = useProfileStore()
const open = ref(false)

const profilList = [
  { id: 'paypey', namaDefault: 'paypey' },
  { id: 'ffazeyall', namaDefault: 'ffazeyall' },
]

const namaTampil = computed(() => {
  return profile.getNama(profile.profilAktif) || profile.profilAktif
})

function pilih(id) {
  profile.gantiProfil(id)
  open.value = false
}
</script>

<style scoped>
.profile-switch {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--r-sm);
  background: var(--c-cream);
  color: var(--c-ink);
  font-weight: 600;
  font-size: .875rem;
}

.profile-chevron {
  font-size: .75rem;
  transition: transform .15s;
}

.profile-chevron.up {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  padding: 48px 16px 0 0;
}

.dropdown-menu {
  background: #fff;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-soft), 0 4px 16px rgba(58,52,44,.12);
  overflow: hidden;
  min-width: 140px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: .875rem;
  color: var(--c-ink);
}

.dropdown-item.active {
  background: var(--c-terra-soft);
  color: #fff;
  font-weight: 600;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid var(--c-line);
}
</style>
