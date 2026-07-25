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

    <ul class="starter-list">
      <li v-for="(item, i) in items" :key="i">{{ item }}</li>
    </ul>
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

// State sembunyi per profil (write-through, reaktif)
const tersembunyi = ref(get(profile.profilAktif, 'starterHidden', false))

// Ganti profil → muat ulang state profil itu
watch(() => profile.profilAktif, (pid) => {
  tersembunyi.value = get(pid, 'starterHidden', false)
})

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
.starter-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.starter-list li {
  position: relative;
  padding: 8px 0 8px 18px;
  font-size: .875rem;
  color: var(--text);
  border-bottom: 1px solid var(--line);
}
.starter-list li:last-child { border-bottom: none; }
.starter-list li::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 15px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
}
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
