<template>
  <div class="card">
    <h3 class="card-title">Catat Ukuran</h3>
    <div class="field-grid">
      <div v-for="f in fields" :key="f.key" class="field">
        <label class="field-label">{{ f.label }}</label>
        <input
          v-model="form[f.key]"
          type="number"
          step="0.1"
          class="input"
          placeholder="cm"
        />
      </div>
    </div>
    <button class="btn" @click="simpan">Simpan</button>

    <div v-if="riwayat.length" class="riwayat">
      <div v-for="e in riwayat.slice(-5).reverse()" :key="e.tanggal" class="riwayat-item">
        <span class="text-muted">{{ e.tanggal.slice(5) }}</span>
        <span v-for="f in fields" :key="f.key" class="riwayat-val">
          {{ f.label.slice(0,3) }}: {{ e[f.key] || '—' }}
        </span>
      </div>
    </div>
    <p v-else class="text-sm text-muted">Belum ada catatan ukuran.</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useTrackingStore } from '../stores/tracking'

const tracking = useTrackingStore()

const fields = [
  { key: 'pinggang', label: 'Pinggang' },
  { key: 'perut', label: 'Perut' },
  { key: 'paha', label: 'Paha' },
  { key: 'lengan', label: 'Lengan' },
  { key: 'pinggul', label: 'Pinggul' },
]

const form = reactive({})
fields.forEach(f => form[f.key] = '')

const riwayat = computed(() => tracking.getRiwayatUkuran())

function simpan() {
  const entry = {}
  let ada = false
  fields.forEach(f => {
    const v = parseFloat(form[f.key])
    if (!isNaN(v) && v > 0) {
      entry[f.key] = v
      ada = true
    }
  })
  if (!ada) return
  tracking.tambahUkuran(entry)
  fields.forEach(f => form[f.key] = '')
}
</script>

<style scoped>
.card {
  background: var(--card);
  border-radius: var(--r-md);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-soft);
}
.card-title {
  font-size: 1rem;
  margin-bottom: 12px;
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: .75rem;
  color: var(--text-muted);
}
.input {
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--bg);
  color: var(--text);
  font-size: .875rem;
  width: 100%;
}
.btn {
  padding: 8px 16px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--r-sm);
  font-weight: 600;
  font-size: .875rem;
}
.riwayat {
  margin-top: 12px;
}
.riwayat-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--line);
  font-size: .8125rem;
}
.riwayat-val {
  font-weight: 500;
}
.text-muted {
  color: var(--text-muted);
}
.text-sm {
  font-size: .8125rem;
}
</style>
