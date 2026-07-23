<template>
  <!-- Mode ringkas (disembunyikan) -->
  <button v-if="tersembunyi" class="peek" @click="setSembunyi(false)">
    Lihat Starter 14 Hari ›
  </button>

  <!-- Kartu penuh -->
  <div v-else class="card">
    <div class="head">
      <div>
        <h3 class="card-title">Fokus 2 minggu pertama</h3>
        <p class="sub">Bangun kebiasaan dulu — beda dari Aturan Makan harian (pola yang jalan terus).</p>
      </div>
      <button class="hide-btn" @click="setSembunyi(true)">Sembunyikan</button>
    </div>

    <div class="count">
      <span class="count-badge">{{ countdownLabel }}</span>
    </div>

    <div v-for="(item, i) in items" :key="i" class="check-row">
      <button class="check-btn" :class="{ done: dicentang[i] }" @click="toggle(i)">
        <span v-if="dicentang[i]" class="check-icon">✓</span>
      </button>
      <span class="check-label" :class="{ done: dicentang[i] }">{{ item }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProgram, getFase } from '../data/program'
import { get, set } from '../lib/storage'

const profile = useProfileStore()
const prog = getProgram()

const items = computed(() => prog.starter14Hari[profile.profilAktif] || [])

// State per profil (write-through, reaktif)
const dicentang = ref(get(profile.profilAktif, 'starterCheck', {}))
const tersembunyi = ref(get(profile.profilAktif, 'starterHidden', false))

// Ganti profil → muat ulang state profil itu
watch(() => profile.profilAktif, (pid) => {
  dicentang.value = get(pid, 'starterCheck', {})
  tersembunyi.value = get(pid, 'starterHidden', false)
})

function toggle(i) {
  dicentang.value = { ...dicentang.value, [i]: !dicentang.value[i] }
  set(profile.profilAktif, 'starterCheck', dicentang.value)
}
function setSembunyi(val) {
  tersembunyi.value = val
  set(profile.profilAktif, 'starterHidden', val)
}

// Countdown dari Fase 1 tglMulai
const countdownLabel = computed(() => {
  const fase = getFase(profile.profilAktif)
  const f1 = fase[0]
  if (!f1) return 'Belum mulai'
  const mulai = new Date(f1.tglMulai + 'T00:00:00')
  const now = new Date()
  const hari = Math.floor((now - mulai) / 86400000) + 1
  if (hari < 1) return 'Belum mulai'
  if (hari > 14) return 'Fokus 14 hari selesai 🎉'
  return `Hari ke-${hari}/14`
})
</script>

<style scoped>
.card {
  background: var(--card);
  border-radius: var(--r-md);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-soft);
  border-left: 4px solid var(--primary);
}
.head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.card-title { font-size: 1rem; }
.sub { font-size: .75rem; color: var(--text-muted); margin-top: 2px; }
.hide-btn { font-size: .75rem; color: var(--text-muted); white-space: nowrap; }
.count { margin: 10px 0; }
.count-badge {
  display: inline-block;
  background: var(--primary);
  color: var(--on-primary);
  font-size: .75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}
.check-row:last-child { border-bottom: none; }
.check-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
}
.check-btn.done { background: var(--primary); border-color: var(--primary); }
.check-icon { color: var(--on-primary); font-size: .75rem; font-weight: 700; }
.check-label { font-size: .875rem; color: var(--text); }
.check-label.done { color: var(--text-muted); text-decoration: line-through; }
.peek {
  width: 100%;
  text-align: left;
  background: var(--surface);
  border-radius: var(--r-md);
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: .8125rem;
  font-weight: 600;
  color: var(--primary);
}
</style>
