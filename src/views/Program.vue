<template>
  <div class="page">
    <h2 class="page-title">Program</h2>
    <p class="page-subtitle">untuk <strong>{{ namaTampil }}</strong></p>

    <div class="subtabs">
      <button class="subtab" :class="{ active: tab === 'latihan' }" @click="tab = 'latihan'">Latihan</button>
      <button class="subtab" :class="{ active: tab === 'makan' }" @click="tab = 'makan'">Makan</button>
    </div>

    <PanelLatihan v-if="tab === 'latihan'" />
    <PanelMakan v-else />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import PanelLatihan from '../components/PanelLatihan.vue'
import PanelMakan from '../components/PanelMakan.vue'

const profile = useProfileStore()
const namaTampil = computed(() => profile.getNama(profile.profilAktif) || profile.profilAktif)

const tab = ref('latihan')
</script>

<style scoped>
.page-title { font-size: 1.5rem; }
.page-subtitle {
  font-size: .875rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}
.subtabs {
  display: flex;
  gap: 4px;
  background: var(--surface);
  padding: 4px;
  border-radius: var(--r-md);
  margin-bottom: 16px;
}
.subtab {
  flex: 1;
  padding: 8px;
  border-radius: var(--r-sm);
  font-size: .875rem;
  font-weight: 600;
  color: var(--text-muted);
}
.subtab.active {
  background: var(--card);
  color: var(--primary);
  box-shadow: var(--shadow-soft);
}
</style>
