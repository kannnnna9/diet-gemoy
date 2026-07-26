<template>
  <div class="card">
    <h3 class="card-title">Catat BB</h3>
    <div class="field-row">
      <input
        v-model="inputKg"
        type="number"
        step="0.1"
        class="input"
        placeholder="kg"
        @keyup.enter="simpan"
      />
      <button class="btn" @click="simpan">Simpan</button>
    </div>
    <p v-if="delta !== null" class="text-sm" :class="delta < 0 ? 'text-sage' : 'text-muted'">
      {{ delta > 0 ? '+' : '' }}{{ delta.toFixed(1) }} kg dari catatan sebelumnya
    </p>
    <div v-if="riwayat.length" class="riwayat">
      <div v-for="e in riwayat.slice(-7).reverse()" :key="e.tanggal" class="riwayat-item">
        <span class="text-muted">{{ e.tanggal.slice(5) }}</span>
        <span class="riwayat-kg">{{ e.kg }} kg</span>
      </div>
    </div>
    <p v-else class="text-sm text-muted">Belum ada catatan BB.</p>

    <DialogKonfirmasi
      v-if="showDialog"
      judul="Konfirmasi Berat Badan"
      @konfirmasi="konfirmasiSimpan"
      @batal="showDialog = false"
    >
      Simpan BB <strong>{{ pending }} kg</strong>? Data tidak bisa dihapus — pastikan sudah benar.
    </DialogKonfirmasi>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTrackingStore } from '../stores/tracking'
import DialogKonfirmasi from './DialogKonfirmasi.vue'

const tracking = useTrackingStore()
const inputKg = ref('')
const pending = ref(null)
const showDialog = ref(false)

const riwayat = computed(() => tracking.getRiwayatBB())
const delta = computed(() => {
  if (riwayat.value.length < 2) return null
  return riwayat.value[riwayat.value.length - 1].kg - riwayat.value[riwayat.value.length - 2].kg
})

function simpan() {
  const kg = parseFloat(inputKg.value)
  if (isNaN(kg) || kg <= 0) return
  pending.value = kg
  showDialog.value = true
}

function konfirmasiSimpan() {
  tracking.tambahBB(pending.value)
  inputKg.value = ''
  showDialog.value = false
  pending.value = null
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
.field-row {
  display: flex;
  gap: 8px;
}
.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--bg);
  color: var(--text);
  font-size: .875rem;
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
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--line);
  font-size: .875rem;
}
.riwayat-kg {
  font-weight: 600;
}
.text-sm {
  font-size: .8125rem;
  margin-top: 8px;
}
.text-muted {
  color: var(--text-muted);
}
.text-sage {
  color: var(--accent);
}
</style>
