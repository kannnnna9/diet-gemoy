<template>
  <div class="page">
    <h2 class="page-title">Progres</h2>
    <p class="page-subtitle">untuk <strong>{{ namaTampil }}</strong></p>

    <div class="card">
      <h3 class="card-title">Riwayat BB</h3>
      <div v-if="riwayatBB.length" class="bb-chart">
        <div
          v-for="(e, i) in riwayatBB.slice(-14)"
          :key="e.tanggal"
          class="bb-bar-wrap"
        >
          <div
            class="bb-bar"
            :style="{ height: barHeight(e.kg) + '%' }"
            :title="e.tanggal + ': ' + e.kg + ' kg'"
          ></div>
          <span class="bb-label">{{ e.kg.toFixed(1) }}</span>
          <span class="bb-date">{{ e.tanggal.slice(5) }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-muted">Belum ada catatan BB.</p>
    </div>

    <div class="card">
      <h3 class="card-title">Riwayat Ukuran</h3>
      <div v-if="riwayatUkuran.length" class="ukuran-list">
        <div v-for="e in riwayatUkuran.slice(-10).reverse()" :key="e.tanggal" class="ukuran-item">
          <span class="ukuran-date">{{ e.tanggal.slice(5) }}</span>
          <span v-for="f in ukuranFields" :key="f.key" class="ukuran-val">
            {{ f.label }}: <strong>{{ e[f.key] || '—' }}</strong>
          </span>
        </div>
      </div>
      <p v-else class="text-sm text-muted">Belum ada catatan ukuran.</p>
    </div>

    <FotoProgres />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { useTrackingStore } from '../stores/tracking'
import FotoProgres from '../components/FotoProgres.vue'

const profile = useProfileStore()
const tracking = useTrackingStore()

const namaTampil = computed(() => profile.getNama(profile.profilAktif) || profile.profilAktif)
const riwayatBB = computed(() => tracking.getRiwayatBB())
const riwayatUkuran = computed(() => tracking.getRiwayatUkuran())

const ukuranFields = [
  { key: 'pinggang', label: 'Pinggang' },
  { key: 'perut', label: 'Perut' },
  { key: 'paha', label: 'Paha' },
  { key: 'lengan', label: 'Lengan' },
  { key: 'pinggul', label: 'Pinggul' },
]

function barHeight(kg) {
  if (!riwayatBB.value.length) return 50
  const vals = riwayatBB.value.map(e => e.kg)
  const min = Math.min(...vals) - 2
  const max = Math.max(...vals) + 1
  const range = max - min
  return ((kg - min) / range) * 100
}
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
}
.page-subtitle {
  font-size: .875rem;
  color: var(--c-ink-soft);
  margin-bottom: 16px;
}
.card {
  background: #fff;
  border-radius: var(--r-md);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-soft);
}
.card-title {
  font-size: 1rem;
  margin-bottom: 12px;
}
.bb-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 160px;
  padding: 8px 0;
}
.bb-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: 2px;
}
.bb-bar {
  width: 100%;
  max-width: 32px;
  background: var(--c-terra-soft);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height .3s;
}
.bb-label {
  font-size: .625rem;
  font-weight: 600;
}
.bb-date {
  font-size: .5625rem;
  color: var(--c-ink-soft);
}
.ukuran-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ukuran-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: .8125rem;
  padding: 6px 0;
  border-bottom: 1px solid var(--c-line);
}
.ukuran-date {
  font-weight: 600;
  min-width: 48px;
}
.ukuran-val {
  color: var(--c-ink-soft);
}
.text-sm { font-size: .8125rem; }
.text-muted { color: var(--c-ink-soft); }
</style>
