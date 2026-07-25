<template>
  <div class="page">
    <div class="greeting">
      <h2 class="greeting-title">Halo, {{ namaTampil }}!</h2>
      <p class="greeting-date">{{ tanggalHariIni }}</p>
    </div>

    <div v-if="faseAktif" class="card fase-card">
      <span class="fase-badge">{{ faseAktif.nama }}</span>
      <p class="text-sm">{{ faseAktif.fokusFase }}</p>
      <p class="text-sm text-muted">Target BB: {{ faseAktif.targetBB }} kg</p>
    </div>

    <div class="card ringkasan-card">
      <div class="ringkasan-item">
        <span class="ringkasan-label">Kalori</span>
        <span class="ringkasan-val">{{ kaloriTampil.min }}–{{ kaloriTampil.max }}</span>
      </div>
      <div class="ringkasan-item">
        <span class="ringkasan-label">Protein</span>
        <span class="ringkasan-val">{{ profil.protein.min }}–{{ profil.protein.max }} g</span>
      </div>
      <div class="ringkasan-item">
        <span class="ringkasan-label">Air</span>
        <span class="ringkasan-val">{{ profil.air }}</span>
      </div>
    </div>

    <div v-if="jadwalHari" class="card">
      <h3 class="card-title">{{ namaHari }}</h3>
      <div v-if="jadwalHari.pagi" class="jadwal-item">
        <span class="jadwal-label">Pagi</span>
        <span>{{ jadwalHari.pagi }}</span>
      </div>
      <div v-if="jadwalHari.sore" class="jadwal-item">
        <span class="jadwal-label">Sore</span>
        <span>{{ jadwalHari.sore }}</span>
      </div>
      <p class="text-sm text-muted">Fokus: {{ jadwalHari.fokus }}</p>
    </div>

    <div v-if="profile.profilAktif === 'ffazeyall'" class="card">
      <label class="toggle-row">
        <span class="toggle-label">Lagi haid</span>
        <input type="checkbox" :checked="profile.modeHaid" @change="profile.setModeHaid($event.target.checked)" />
      </label>
      <div v-if="profile.modeHaid" class="haid-banner">
        <p class="text-sm"><strong>Mode haid aktif</strong></p>
        <p class="text-sm">Strength −30% (rep/set terkoreksi otomatis)</p>
        <p class="text-sm">Interval di-skip (tandai "diistirahatkan")</p>
        <p class="text-sm">Kalori +100–200 ({{ kaloriTampil.min }}–{{ kaloriTampil.max }} kkal)</p>
        <p class="text-sm text-catatan">BB naik = retensi air, wajar. Cek lagi setelah haid.</p>
      </div>
    </div>

    <ReminderSekarang />

    <StarterCard />

    <ChecklistHari />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProfil, getFaseAktif, getJadwalHari, getHariIni, getProgram } from '../data/program'
import ChecklistHari from '../components/ChecklistHari.vue'
import StarterCard from '../components/StarterCard.vue'
import ReminderSekarang from '../components/ReminderSekarang.vue'

const profile = useProfileStore()
const prog = getProgram()

const hariNames = { minggu:'Minggu', senin:'Senin', selasa:'Selasa', rabu:'Rabu', kamis:'Kamis', jumat:'Jumat', sabtu:'Sabtu' }
const namaHari = computed(() => hariNames[getHariIni()])

const tanggalHariIni = new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

const namaTampil = computed(() => profile.getNama(profile.profilAktif) || profile.profilAktif)
const profil = computed(() => getProfil(profile.profilAktif))
const faseAktif = computed(() => getFaseAktif(profile.profilAktif))
const jadwalHari = computed(() => getJadwalHari(profile.profilAktif, getHariIni()))

const kaloriTampil = computed(() => {
  const base = profil.value.kalori
  if (profile.profilAktif === 'ffazeyall' && profile.modeHaid) {
    const haid = prog.aturanHaid
    return {
      min: base.min + (haid?.kaloriDelta?.min || 100),
      max: base.max + (haid?.kaloriDelta?.max || 200),
    }
  }
  return { min: base.min, max: base.max }
})
</script>

<style scoped>
.greeting {
  margin-bottom: 16px;
}
.greeting-title {
  font-size: 1.5rem;
}
.greeting-date {
  font-size: .8125rem;
  color: var(--text-muted);
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
.fase-card {
  border-left: 4px solid var(--accent);
}
.fase-badge {
  display: inline-block;
  background: var(--accent-soft);
  color: var(--on-primary);
  font-size: .75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
  margin-bottom: 8px;
}
.ringkasan-card {
  display: flex;
  gap: 16px;
}
.ringkasan-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ringkasan-label {
  font-size: .6875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}
.ringkasan-val {
  font-weight: 700;
  font-size: 1rem;
}
.jadwal-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 4px 0;
}
.jadwal-label {
  font-weight: 600;
  min-width: 44px;
  color: var(--primary);
  font-size: .8125rem;
}
.text-sm {
  font-size: .8125rem;
}
.text-muted {
  color: var(--text-muted);
}
.text-catatan {
  color: var(--danger);
  font-weight: 600;
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
.toggle-label {
  font-weight: 600;
}
.haid-banner {
  margin-top: 12px;
  padding: 12px;
  background: var(--warn-bg);
  border-radius: var(--r-sm);
  border: 1px solid var(--warn-line);
}
</style>
