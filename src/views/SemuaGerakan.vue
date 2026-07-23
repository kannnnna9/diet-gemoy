<template>
  <div class="page">
    <button class="back" @click="$router.push('/program')">‹ Kembali ke Program</button>
    <h2 class="page-title">Semua Gerakan</h2>
    <p class="page-subtitle">Ensiklopedia {{ semuaGerakan.length }} gerakan — cari referensi cara main.</p>

    <div class="filter-tabs">
      <button class="filter-tab" :class="{ active: filterKategori === '' }" @click="filterKategori = ''">Semua</button>
      <button
        v-for="k in kategoriList"
        :key="k"
        class="filter-tab"
        :class="{ active: filterKategori === k }"
        @click="filterKategori = k"
      >{{ k }}</button>
    </div>

    <div class="gerakan-grid">
      <KartuGerakan
        v-for="g in gerakanFiltered"
        :key="g.id"
        :gerakan="g"
        @ganti="gantiGerakan"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getGerakanList, getGerakan } from '../data/program'
import KartuGerakan from '../components/KartuGerakan.vue'

const filterKategori = ref('')
const semuaGerakan = computed(() => getGerakanList())
const kategoriList = computed(() => {
  const set = new Set(semuaGerakan.value.map(g => g.kategori).filter(Boolean))
  return [...set]
})
const gerakanFiltered = computed(() => {
  if (!filterKategori.value) return semuaGerakan.value
  return semuaGerakan.value.filter(g => g.kategori === filterKategori.value)
})

function gantiGerakan(penggantiId) {
  const g = getGerakan(penggantiId)
  if (g) filterKategori.value = g.kategori
}
</script>

<style scoped>
.back {
  color: var(--text-muted);
  font-size: .8125rem;
  margin-bottom: 8px;
}
.page-title { font-size: 1.5rem; }
.page-subtitle {
  font-size: .875rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}
.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}
.filter-tab {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: .75rem;
  background: var(--bg);
  color: var(--text-muted);
}
.filter-tab.active {
  background: var(--accent);
  color: var(--on-primary);
  font-weight: 600;
}
.gerakan-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
