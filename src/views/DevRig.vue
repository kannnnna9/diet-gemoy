<template>
  <div class="page dev-rig">
    <button class="back" @click="$router.push('/')">‹ Kembali</button>
    <h2 class="page-title">Uji Rig</h2>

    <RigFigur :pose="posePreview || pose" class="figur" />
    <div class="info">
      yAkar <b>{{ pose.akar.y.toFixed(1) }}</b> · yAnkle
      <b>{{ pose.ankle.dekat.y.toFixed(1) }}</b> · yKepala
      <b>{{ pose.kepalaPusat.y.toFixed(1) }}</b> · yLutut
      <b>{{ pose.lutut.dekat.y.toFixed(1) }}</b>
    </div>

    <div class="panel">
      <div v-for="sl in slider" :key="sl.k" class="baris">
        <span class="label">{{ sl.label }}</span>
        <input v-model.number="s[sl.k]" type="range" :min="sl.min" :max="sl.max" step="1" />
        <span class="nilai">{{ s[sl.k] }}°</span>
      </div>

      <div class="baris">
        <span class="label">Akar rotasi</span>
        <input v-model.number="s.rotasi" type="range" min="-90" max="90" step="1" />
        <span class="nilai">{{ s.rotasi }}°</span>
      </div>

      <div class="baris">
        <span class="label">Akar x</span>
        <input v-model.number="s.akarX" type="range" min="-40" max="40" step="1" />
        <span class="nilai">{{ s.akarX }}</span>
      </div>

      <div class="baris">
        <span class="label">Kontak</span>
        <select v-model="s.kontak" class="pilih">
          <option v-for="k in kontakList" :key="k" :value="k">{{ k }}</option>
        </select>
      </div>
    </div>

    <div class="aksi">
      <button class="btn" @click="salinKeyframe">Salin JSON keyframe</button>
      <button class="btn" @click="isiDariArea">Terapkan JSON</button>
      <button class="btn" @click="putarAset">Putar preview</button>
    </div>
    <textarea v-model="area" class="area" rows="6" placeholder='Tempel JSON keyframe di sini…' />

    <p v-if="pesan" class="pesan">{{ pesan }}</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { hitungPose } from '../lib/rig.js'
import { poseSaat, durasiEfektif } from '../lib/rigAnim.js'
import RigFigur from '../components/RigFigur.vue'

const s = reactive({
  torsoCondong: 0, leher: 0,
  bahuDekat: 0, sikuDekat: 0, bahuJauh: 0, sikuJauh: 0,
  pinggulDekat: 0, lututDekat: 0, pinggulJauh: 0, lututJauh: 0,
  rotasi: 0, akarX: 0,
  kontak: 'kaki',
})

const slider = [
  { k: 'torsoCondong', label: 'Torso', min: 0, max: 75 },
  { k: 'leher', label: 'Leher', min: -20, max: 30 },
  { k: 'bahuDekat', label: 'Bahu dekat', min: -45, max: 180 },
  { k: 'sikuDekat', label: 'Siku dekat', min: 0, max: 150 },
  { k: 'bahuJauh', label: 'Bahu jauh', min: -45, max: 180 },
  { k: 'sikuJauh', label: 'Siku jauh', min: 0, max: 150 },
  { k: 'pinggulDekat', label: 'Pinggul dekat', min: -30, max: 120 },
  { k: 'lututDekat', label: 'Lutut dekat', min: 0, max: 140 },
  { k: 'pinggulJauh', label: 'Pinggul jauh', min: -30, max: 120 },
  { k: 'lututJauh', label: 'Lutut jauh', min: 0, max: 140 },
]

const kontakList = ['kaki', 'punggung', 'sisi', 'tangan-kaki', 'bebas']

const kf = computed(() => ({
  akar: { x: s.akarX, rotasi: s.rotasi },
  torsoCondong: s.torsoCondong,
  leher: s.leher,
  bahuDekat: s.bahuDekat, sikuDekat: s.sikuDekat,
  bahuJauh: s.bahuJauh, sikuJauh: s.sikuJauh,
  pinggulDekat: s.pinggulDekat, lututDekat: s.lututDekat,
  pinggulJauh: s.pinggulJauh, lututJauh: s.lututJauh,
}))

const pose = computed(() => hitungPose(kf.value, { kontak: s.kontak }))

const area = ref('')
const pesan = ref('')

// Mode putar: memutar aset lengkap yang ditempel (poseSaat + hitungPose, rAF).
const posePreview = ref(null)
let rafId = 0
let asetPreview = null

function hentiPreview() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

onUnmounted(hentiPreview)

function putarAset() {
  try {
    const data = JSON.parse(area.value)
    if (!data.keyframes || !Array.isArray(data.keyframes) || data.keyframes.length < 2) {
      pesan.value = 'Tempel aset LENGKAP (berisi keyframes) untuk preview.'
      return
    }
    hentiPreview()
    asetPreview = data
    const t0 = performance.now()
    const durasi = durasiEfektif(data)
    const opts = { kontak: data.kontak, tambat: data.tambat }
    const loop = (now) => {
      const tNorm = ((now - t0) % durasi) / durasi
      posePreview.value = hitungPose(poseSaat(data, tNorm), opts)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    pesan.value = `Memutar "${data.id}" — ${durasi}ms per siklus.`
  } catch {
    pesan.value = 'JSON tidak valid.'
  }
}

function keyframeJson() {
  return {
    t: null,
    akar: { x: s.akarX, rotasi: s.rotasi },
    torsoCondong: s.torsoCondong,
    leher: s.leher,
    bahuDekat: s.bahuDekat, sikuDekat: s.sikuDekat,
    bahuJauh: s.bahuJauh, sikuJauh: s.sikuJauh,
    pinggulDekat: s.pinggulDekat, lututDekat: s.lututDekat,
    pinggulJauh: s.pinggulJauh, lututJauh: s.lututJauh,
  }
}

async function salinKeyframe() {
  const teks = JSON.stringify(keyframeJson(), null, 2)
  area.value = teks
  try {
    await navigator.clipboard.writeText(teks)
    pesan.value = 'Tersalin ke clipboard.'
  } catch {
    pesan.value = 'Clipboard tak tersedia — salin dari textarea di bawah.'
  }
}

function isiDariArea() {
  try {
    const data = JSON.parse(area.value)
    const k = data.keyframes ? data.keyframes[data.keyframes.length - 1] : data
    Object.assign(s, {
      torsoCondong: k.torsoCondong ?? 0,
      leher: k.leher ?? 0,
      bahuDekat: k.bahuDekat ?? 0, sikuDekat: k.sikuDekat ?? 0,
      bahuJauh: k.bahuJauh ?? 0, sikuJauh: k.sikuJauh ?? 0,
      pinggulDekat: k.pinggulDekat ?? 0, lututDekat: k.lututDekat ?? 0,
      pinggulJauh: k.pinggulJauh ?? 0, lututJauh: k.lututJauh ?? 0,
      rotasi: k.akar?.rotasi ?? 0,
      akarX: k.akar?.x ?? 0,
    })
    pesan.value = 'JSON diterapkan.'
  } catch {
    pesan.value = 'JSON tidak valid.'
  }
}
</script>

<style scoped>
.dev-rig {
  padding-bottom: 40px;
}
.back {
  color: var(--text-muted);
  font-size: .8125rem;
  margin-bottom: 8px;
}
.page-title { font-size: 1.5rem; }
.figur {
  max-width: 280px;
  margin: 8px auto;
  border-radius: var(--r-md);
  overflow: hidden;
  border: 1px solid var(--line);
}
.info {
  text-align: center;
  font-size: .8125rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.info b { color: var(--text); }
.panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 12px;
  margin-bottom: 12px;
}
.baris {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .75rem;
}
.label { flex: 0 0 92px; color: var(--text-muted); }
.baris input[type='range'] { flex: 1; }
.nilai { flex: 0 0 52px; text-align: right; font-variant-numeric: tabular-nums; }
.pilih {
  flex: 1;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
}
.aksi {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.btn {
  flex: 1;
  padding: 10px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--r-sm);
  font-weight: 600;
}
.area {
  width: 100%;
  font-family: monospace;
  font-size: .75rem;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--card);
  color: var(--text);
  padding: 8px;
}
.pesan {
  margin-top: 8px;
  font-size: .75rem;
  color: var(--text-muted);
}
</style>
