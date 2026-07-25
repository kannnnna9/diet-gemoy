<template>
  <div class="page">
    <h2 class="page-title">Pengaturan</h2>

    <section class="card">
      <h3 class="card-title">Nama Profil</h3>
      <div class="field">
        <label class="field-label">Nama tampilan untuk <strong>{{ profile.profilAktif }}</strong></label>
        <div class="field-row">
          <input
            v-model="namaBaru"
            class="input"
            :placeholder="profile.profilAktif"
            @keyup.enter="simpanNama"
          />
          <button class="btn" @click="simpanNama">Simpan</button>
        </div>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">Ganti Profil</h3>
      <p class="text-sm">Profil aktif saat ini: <strong>{{ namaTampil }}</strong></p>
      <div class="profil-list">
        <button
          v-for="p in profilList"
          :key="p.id"
          class="btn-outline"
          :class="{ active: p.id === profile.profilAktif }"
          @click="profile.gantiProfil(p.id)"
        >
          {{ profile.getNama(p.id) || p.namaDefault }}
        </button>
      </div>
    </section>

    <section v-if="profile.profilAktif === 'ffazeyall'" class="card">
      <h3 class="card-title">Mode Haid</h3>
      <label class="toggle-row">
        <span>Lagi haid</span>
        <input type="checkbox" :checked="profile.modeHaid" @change="profile.setModeHaid($event.target.checked)" />
      </label>
      <p v-if="profile.modeHaid" class="text-sm text-warning">
        Mode haid aktif: strength −30%, interval di-skip, kalori +100–200.
      </p>
    </section>

    <section class="card">
      <h3 class="card-title">Jadwal ke Kalender</h3>
      <p class="text-sm">Unduh file kalender berisi jam-jam penting (ganjel, IF, snack, latihan, tidur). Buka file → masuk Google Kalender, notif ditangani Google.</p>
      <button class="btn export-btn" @click="exportKalender">Export ke Kalender (.ics)</button>
    </section>

    <section class="card card-about">
      <h3 class="card-title">Tentang</h3>
      <p class="text-sm">Diet Gemoy — companion program diet pribadi.</p>
      <p class="text-sm">Versi 1.0.2 — Fase 1 + reminder & export kalender.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getSlotHarian } from '../data/program'
import { downloadIcs } from '../lib/ics'

const profile = useProfileStore()
const namaBaru = ref('')

const profilList = [
  { id: 'paypey', namaDefault: 'paypey' },
  { id: 'ffazeyall', namaDefault: 'ffazeyall' },
]

const namaTampil = computed(() => {
  return profile.getNama(profile.profilAktif) || profile.profilAktif
})

function exportKalender() {
  downloadIcs(getSlotHarian(profile.profilAktif), profile.profilAktif)
}

function simpanNama() {
  if (namaBaru.value.trim()) {
    profile.ubahNama(profile.profilAktif, namaBaru.value.trim())
    namaBaru.value = ''
  }
}
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
  margin-bottom: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: .875rem;
  color: var(--text-muted);
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

.btn-outline {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  color: var(--text);
  font-size: .875rem;
  margin-right: 8px;
  margin-bottom: 8px;
}

.btn-outline.active {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--on-primary);
}

.profil-list {
  margin-top: 8px;
}

.text-sm {
  font-size: .8125rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.text-warning {
  color: var(--danger);
  margin-top: 8px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: .875rem;
  cursor: pointer;
}

.toggle-row input {
  width: 44px;
  height: 24px;
  accent-color: var(--primary);
}

.export-btn { margin-top: 10px; font-weight: 600; }

.card-about {
  margin-top: 24px;
}
</style>
