<template>
  <div class="page">
    <h2 class="page-title">Progres Pasangan</h2>

    <p v-if="!auth.pasanganUserId" class="text-muted">Pasangan belum tertaut.</p>

    <template v-else>
      <section class="card">
        <h3 class="card-title">BB Terkini</h3>
        <p class="big">{{ bbTerkini ?? '—' }} kg</p>
        <p v-if="bbTanggal" class="text-sm">per {{ formatTanggalId(bbTanggal) }}</p>
      </section>

      <section class="card">
        <h3 class="card-title">Checklist hari ini</h3>
        <p class="checklist-ringkas">{{ checklistRingkas }}</p>
      </section>

      <p class="text-sm catatan">Data pasangan read-only. Foto tetap lokal di HP masing-masing.</p>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { get } from '../lib/storage'
import { formatTanggalId } from '../data/program'

const auth = useAuthStore()
const cache = ref([])

onMounted(() => {
  cache.value = get('_global', 'partnerCache', [])
})

const bbTerkini = computed(() => {
  const bb = cache.value
    .filter(r => r.jenis === 'bb')
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0]
  return bb?.payload?.kg ?? null
})

const bbTanggal = computed(() => {
  const bb = cache.value
    .filter(r => r.jenis === 'bb')
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0]
  return bb?.tanggal ?? null
})

const checklistRingkas = computed(() => {
  const hari = new Date().toISOString().slice(0, 10)
  const cl = cache.value.find(r => r.jenis === 'checklist' && r.tanggal === hari)
  if (!cl) return 'Belum ada'
  const total = Object.keys(cl.payload || {}).length
  const done = Object.values(cl.payload || {}).filter(Boolean).length
  return total > 0 ? `${done}/${total} tercentang` : 'Belum ada'
})
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
}
.card {
  background: var(--card);
  border-radius: var(--r-md);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-soft);
}
.card-title {
  font-size: 1rem;
  margin-bottom: 8px;
}
.big {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}
.text-sm {
  font-size: .8125rem;
  color: var(--text-muted);
  margin-top: 4px;
}
.text-muted {
  color: var(--text-muted);
  font-size: .9rem;
}
.checklist-ringkas {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}
.catatan {
  margin-top: 12px;
}
</style>
