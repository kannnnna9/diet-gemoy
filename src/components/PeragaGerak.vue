<template>
  <div ref="wadah" class="peraga" role="img" :aria-label="`Peraga gerakan ${nama || id}`">
    <RigFigur v-if="pose" :pose="pose" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { hitungPose } from '../lib/rig.js'
import { poseSaat, durasiEfektif } from '../lib/rigAnim.js'
import RigFigur from './RigFigur.vue'

const props = defineProps({
  id: { type: String, required: true },
})
const emit = defineEmits(['tak-ada'])

const pose = ref(null)
const nama = ref('')
const wadah = ref(null)

// Cache modul-level: manifes dimuat sekali, aset sekali per id (spec §7).
const cacheAset = new Map()
let cacheManifes = null

async function muatAset(id) {
  if (cacheAset.has(id)) return cacheAset.get(id)
  const janji = (async () => {
    const base = import.meta.env.BASE_URL || './'
    if (!cacheManifes) {
      cacheManifes = fetch(`${base}gerakan-anim/index.json`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    }
    const ids = await cacheManifes
    if (!ids || !Array.isArray(ids) || !ids.includes(id)) return null
    const resp = await fetch(`${base}gerakan-anim/${id}.json`)
    if (!resp.ok) return null
    const data = await resp.json()
    if (!data || !Array.isArray(data.keyframes) || data.keyframes.length === 0) return null
    return data
  })()
  cacheAset.set(id, janji)
  return janji
}

let aset = null
let rafId = 0
let t0 = 0
let observer = null
let dibongkar = false
const diri = {} // identitas instance untuk penjaga satu-animasi-per-layar
const optsAnimasi = () => ({ kontak: aset.kontak, tambat: aset.tambat })

// Penjaga spec §7: maksimum SATU animasi berjalan per layar. Modul-level —
// instance kedua yang terlihat menampilkan pose statis, tidak menambah loop rAF.
let pemegangAnimasi = null

function henti() {
  if (pemegangAnimasi === diri) pemegangAnimasi = null
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function mulai() {
  if (rafId || !aset) return
  if (pemegangAnimasi && pemegangAnimasi !== diri) {
    pose.value = hitungPose(aset.keyframes[aset.keyframes.length - 1], optsAnimasi())
    return
  }
  pemegangAnimasi = diri
  t0 = performance.now()
  const durasi = durasiEfektif(aset)
  const loop = (now) => {
    const tNorm = ((now - t0) % durasi) / durasi
    pose.value = hitungPose(poseSaat(aset, tNorm), optsAnimasi())
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

function sinkronTab() {
  if (document.hidden) henti()
  else if (observer?.isIntersecting ?? true) mulai()
}

onMounted(async () => {
  const data = await muatAset(props.id)
  if (dibongkar) return
  if (!data) {
    emit('tak-ada')
    return
  }
  aset = data
  nama.value = data.nama || ''

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Aksesibilitas: tanpa animasi, tampilkan pose keyframe TERDALAM sebagai statis.
    pose.value = hitungPose(
      aset.keyframes[aset.keyframes.length - 1],
      optsAnimasi(),
    )
    return
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) mulai()
    else henti()
  })
  observer.observe(wadah.value)
  document.addEventListener('visibilitychange', sinkronTab)
  mulai()
})

onUnmounted(() => {
  dibongkar = true
  henti()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', sinkronTab)
})
</script>

<style scoped>
.peraga {
  width: 100%;
  height: 100%;
  background: var(--surface);
}
</style>
