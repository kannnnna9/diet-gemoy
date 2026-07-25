<template>
  <div v-if="slot" class="card reminder" role="region" aria-label="Reminder saat ini">
    <div class="reminder-head">
      <span class="reminder-badge">Sekarang waktunya</span>
      <span class="reminder-jam">{{ slot.jam }}</span>
    </div>
    <p class="reminder-label">{{ slot.label }}</p>
    <p v-if="slot.catatan" class="reminder-catatan">{{ slot.catatan }}</p>
    <button class="reminder-btn" @click="nudge = !nudge" type="button" aria-expanded="false" :aria-label="nudge ? 'Tutup nudge' : 'Ingatkan aku'">Ingatkan aku</button>
    <transition name="fade">
      <p v-if="nudge" class="reminder-nudge">
        Pasang alarm HP jam {{ slot.jam }} untuk "{{ slot.label }}". Web tak bisa bunyi saat app tertutup.
      </p>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getSlotHarian } from '../data/program'
import { slotSekarang } from '../lib/slotAktif'

const profile = useProfileStore()
const nudge = ref(false)

const slot = computed(() => {
  const now = new Date()
  const menit = now.getHours() * 60 + now.getMinutes()
  return slotSekarang(getSlotHarian(profile.profilAktif), menit)
})
</script>

<style scoped>
.reminder { border-left: 4px solid var(--primary); }
.reminder-head { display: flex; align-items: center; justify-content: space-between; }
.reminder-badge { background: var(--primary); color: var(--on-primary); font-size: .7rem; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.reminder-jam { font-weight: 700; color: var(--primary); }
.reminder-label { font-size: 1rem; font-weight: 600; margin-top: 8px; }
.reminder-catatan { font-size: .8125rem; color: var(--text-muted); margin-top: 2px; }
.reminder-btn { margin-top: 10px; font-size: .8125rem; font-weight: 600; color: var(--primary); background: none; border: none; cursor: pointer; padding: 0; }
.reminder-btn:hover { text-decoration: underline; }
.reminder-nudge { margin-top: 8px; font-size: .8125rem; color: var(--text-muted); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
