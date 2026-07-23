<template>
  <div>
    <section class="card">
      <h3 class="card-title">Ringkasan</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Kalori</span>
          <span class="info-val">{{ profil.kalori.min }}–{{ profil.kalori.max }} kkal</span>
        </div>
        <div class="info-item">
          <span class="info-label">Protein</span>
          <span class="info-val">{{ profil.protein.min }}–{{ profil.protein.max }} g</span>
        </div>
        <div class="info-item">
          <span class="info-label">BB target</span>
          <span class="info-val">{{ profil.baseline.bbAwal }} → {{ profil.baseline.bbTarget }} kg</span>
        </div>
        <div class="info-item">
          <span class="info-label">Pola makan</span>
          <span class="info-val">{{ profil.polaMakan.tipe === 'IF' ? 'IF ' + profil.polaMakan.window : 'Ganjel pagi' }}</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">Fase</h3>
      <div v-for="f in faseList" :key="f.id" class="fase-item" :class="{ aktif: f.id === faseAktif?.id }">
        <button class="fase-header" @click="toggleFase(f.id)">
          <span>
            <strong>{{ f.nama }}</strong>
            <span class="text-sm"> — {{ f.tglMulai }} s.d. {{ f.tglSelesai }}</span>
          </span>
          <span class="chevron" :class="{ open: faseTerbuka[f.id] }">▾</span>
        </button>
        <div v-if="faseTerbuka[f.id]" class="fase-body">
          <p class="text-sm">{{ f.fokusFase }}</p>
          <p class="text-sm">Target BB: <strong>{{ f.targetBB }}</strong> kg</p>
          <p v-if="f.checkpoint?.catatan" class="text-sm text-muted">{{ f.checkpoint.catatan }}</p>
        </div>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">Jadwal Mingguan</h3>
      <div class="hari-tabs">
        <button
          v-for="h in hariList"
          :key="h"
          class="hari-tab"
          :class="{ active: hariAktif === h }"
          @click="hariAktif = h"
        >{{ h.slice(0, 3) }}</button>
      </div>

      <div v-if="jadwalHari" class="jadwal-detail">
        <div v-if="jadwalHari.pagi" class="jadwal-row">
          <span class="jadwal-time">Pagi</span>
          <span>{{ jadwalHari.pagi }}</span>
        </div>
        <div v-if="jadwalHari.sore" class="jadwal-row">
          <span class="jadwal-time">Sore</span>
          <span>{{ jadwalHari.sore }}</span>
        </div>
        <p class="text-sm text-muted">{{ jadwalHari.fokus }}</p>
        <p v-if="jadwalHari.catatan" class="text-sm text-warning">{{ jadwalHari.catatan }}</p>

        <!-- Sesi latihan actionable -->
        <div v-for="grup in sesiHari" :key="grup.id" class="sesi-grup">
          <div class="sesi-head">
            <strong>{{ grup.nama }}</strong>
            <span class="sesi-meta">
              <template v-if="grup.set">{{ grup.set }} set</template>
              <template v-if="grup.istirahat"> · istirahat {{ grup.istirahat }}</template>
            </span>
          </div>
          <ItemLatihan
            v-for="(it, i) in grup.item"
            :key="grup.id + '-' + i"
            :gerakan-id="it.gerakanId"
            :rep="it.rep || it.target || ''"
            :set="grup.set"
          />
        </div>

        <p v-if="!sesiHari.length" class="text-sm text-muted sesi-kosong">
          Hari ini tanpa daftar latihan terstruktur — ikuti catatan di atas.
        </p>
      </div>
    </section>

    <button class="link-card" @click="$router.push('/gerakan')">
      <span>
        <strong>Semua Gerakan</strong>
        <span class="link-sub">Ensiklopedia cara main tiap gerakan</span>
      </span>
      <span class="link-arrow">›</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProfil, getFase, getFaseAktif, getJadwal, getHariIni, getSesi } from '../data/program'
import ItemLatihan from './ItemLatihan.vue'

const profile = useProfileStore()

const profil = computed(() => getProfil(profile.profilAktif))
const faseList = computed(() => getFase(profile.profilAktif))
const faseAktif = computed(() => getFaseAktif(profile.profilAktif))

const hariList = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']
const hariAktif = ref(getHariIni())

const jadwalHari = computed(() => {
  const j = getJadwal(profile.profilAktif)
  return j[hariAktif.value] || null
})

// Ambil hanya sesi yang benar-benar ada di sesiLatihan (lewati id recovery seperti "jalan-santai").
const sesiHari = computed(() => {
  const ids = jadwalHari.value?.sesi || []
  return ids.map(id => getSesi(id)).filter(Boolean)
})

const faseTerbuka = ref({})
function toggleFase(id) {
  faseTerbuka.value[id] = !faseTerbuka.value[id]
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
.card-title { font-size: 1rem; margin-bottom: 12px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { display: flex; flex-direction: column; }
.info-label {
  font-size: .75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}
.info-val { font-weight: 600; font-size: .9375rem; }
.fase-item {
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  margin-bottom: 8px;
  overflow: hidden;
}
.fase-item.aktif { border-color: var(--accent-soft); }
.fase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  color: var(--text);
}
.chevron { transition: transform .15s; color: var(--text-muted); }
.chevron.open { transform: rotate(180deg); }
.fase-body {
  padding: 0 12px 12px;
  border-top: 1px solid var(--line);
  padding-top: 8px;
}
.hari-tabs { display: flex; gap: 4px; margin-bottom: 12px; overflow-x: auto; }
.hari-tab {
  padding: 6px 12px;
  border-radius: var(--r-sm);
  font-size: .8125rem;
  color: var(--text-muted);
  background: var(--bg);
  white-space: nowrap;
}
.hari-tab.active { background: var(--primary); color: var(--on-primary); font-weight: 600; }
.jadwal-detail { display: flex; flex-direction: column; gap: 8px; }
.jadwal-row { display: flex; gap: 12px; align-items: baseline; }
.jadwal-time {
  font-weight: 600;
  min-width: 48px;
  font-size: .8125rem;
  color: var(--primary);
}
.sesi-grup { margin-top: 8px; }
.sesi-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0 6px;
  gap: 8px;
}
.sesi-meta { font-size: .75rem; color: var(--text-muted); white-space: nowrap; }
.sesi-kosong { margin-top: 8px; }
.text-sm { font-size: .8125rem; }
.text-muted { color: var(--text-muted); }
.text-warning { color: var(--danger); }
.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  background: var(--card);
  border-radius: var(--r-md);
  padding: 16px;
  box-shadow: var(--shadow-soft);
  color: var(--text);
}
.link-sub {
  display: block;
  font-size: .75rem;
  color: var(--text-muted);
  margin-top: 2px;
}
.link-arrow { font-size: 1.25rem; color: var(--text-muted); }
</style>
