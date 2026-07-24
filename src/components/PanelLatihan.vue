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
      <div class="stepper">
        <button
          v-for="f in faseStepper"
          :key="f.id"
          class="step"
          :class="[f.status, { terpilih: f.id === faseTerpilih }]"
          :aria-current="f.status === 'aktif' ? 'step' : undefined"
          @click="faseTerpilih = f.id"
        >
          <span class="dot">{{ f.nomor }}</span>
          <span class="step-lbl">{{ f.labelPendek }}</span>
        </button>
      </div>

      <div v-if="faseDetail" class="fase-detail">
        <div class="fase-nama">{{ faseDetail.nama }}</div>
        <div class="fase-tgl">{{ formatTanggalId(faseDetail.tglMulai) }} – {{ formatTanggalId(faseDetail.tglSelesai) }}</div>
        <p class="text-sm fase-fokus">{{ faseDetail.fokusFase }}</p>
        <p class="text-sm">Target BB: <strong>{{ faseDetail.targetBB }}</strong> kg</p>
        <p v-if="faseDetail.checkpoint?.catatan" class="text-sm text-muted">{{ faseDetail.checkpoint.catatan }}</p>
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
import { ref, computed, watch } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProfil, getFase, getFaseAktif, getJadwal, getHariIni, getSesi, formatTanggalId } from '../data/program'
import ItemLatihan from './ItemLatihan.vue'

const profile = useProfileStore()

const profil = computed(() => getProfil(profile.profilAktif))
const faseList = computed(() => getFase(profile.profilAktif))

function statusFase(f, today) {
  if (today > f.tglSelesai) return 'lewat'
  if (today >= f.tglMulai) return 'aktif'
  return 'nanti'
}

const faseStepper = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return faseList.value.map((f, i) => ({
    ...f,
    nomor: i + 1,
    status: statusFase(f, today),
    labelPendek: f.nama.includes('—') ? f.nama.split('—')[1].trim() : `Fase ${i + 1}`,
  }))
})

const faseTerpilih = ref(null)

// Default = fase aktif; kalau belum ada fase aktif (mis. sebelum program mulai) → fase pertama.
const idFaseDefault = computed(() => {
  const aktif = getFaseAktif(profile.profilAktif)
  return aktif?.id || faseList.value[0]?.id || null
})

// Reset pilihan saat profil ganti (default ikut profil baru).
watch(idFaseDefault, (id) => { faseTerpilih.value = id }, { immediate: true })

const faseDetail = computed(() =>
  faseStepper.value.find(f => f.id === faseTerpilih.value) || null
)

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
.stepper { display: flex; margin-bottom: 14px; }
.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  background: none;
  padding: 0;
}
.step .dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: .85rem;
  background: var(--surface);
  color: var(--text-muted);
  z-index: 1;
  transition: box-shadow .15s;
}
.step-lbl {
  font-size: .62rem;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.2;
}
/* garis penghubung ke kanan tiap bulatan */
.step::after {
  content: "";
  position: absolute;
  top: 15px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: var(--line);
  z-index: 0;
}
.step:last-child::after { display: none; }
/* status temporal */
.step.lewat .dot { background: var(--accent-soft); color: var(--on-primary); }
.step.lewat::after { background: var(--accent-soft); }
.step.aktif .dot {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent);
}
/* seleksi (independen dari status) */
.step.terpilih .step-lbl { color: var(--primary); font-weight: 700; }

.fase-detail {
  background: var(--bg);
  border-radius: var(--r-sm);
  padding: 12px;
}
.fase-nama { font-weight: 700; font-size: .95rem; }
.fase-tgl { font-size: .72rem; color: var(--text-muted); margin: 2px 0 8px; }
.fase-fokus { margin-bottom: 4px; }
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
