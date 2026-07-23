<template>
  <div class="card">
    <div class="checklist-header">
      <h3 class="card-title">Checklist Hari Ini</h3>
      <span class="checklist-progress">{{ centangCount }}/{{ items.length }}</span>
    </div>
    <div v-for="item in items" :key="item.id" class="checklist-item">
      <button
        class="check-btn"
        :class="{ done: checklist[item.id] }"
        @click="toggle(item.id)"
      >
        <span v-if="checklist[item.id]" class="check-icon">✓</span>
      </button>
      <span class="check-label" :class="{ done: checklist[item.id] }">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { useTrackingStore } from '../stores/tracking'

const profile = useProfileStore()
const tracking = useTrackingStore()

const hari = new Date().toISOString().slice(0, 10)

const checklist = computed(() => tracking.getChecklist(hari))

const itemDefs = {
  paypey: [
    { id: 'ganjel', label: 'Ganjel pagi (sebelum 04.50)' },
    { id: 'protein', label: 'Protein tiap makan utama' },
    { id: 'air', label: 'Air min. 2 L' },
    { id: 'jalan', label: 'Jalan sesuai jadwal' },
    { id: 'latihan', label: 'Latihan strength/core' },
    { id: 'ngemil', label: 'Ngemil sadar, max 1 porsi manis' },
  ],
  ffazeyall: [
    { id: 'if', label: 'IF window 11.00–19.00' },
    { id: 'protein', label: 'Protein tiap makan' },
    { id: 'snack', label: 'Snack sore wajib' },
    { id: 'air', label: 'Air min. 2 L' },
    { id: 'jalan', label: 'Jalan pagi' },
    { id: 'latihan', label: 'Strength sore' },
    { id: 'ngemil-malam', label: 'Ngemil malam terkontrol' },
  ],
}

const items = computed(() => itemDefs[profile.profilAktif] || itemDefs.paypey)
const centangCount = computed(() => items.value.filter(i => checklist.value[i.id]).length)

function toggle(id) {
  tracking.setChecklistItem(hari, id, !checklist.value[id])
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
}
.checklist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.checklist-progress {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--accent);
}
.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}
.checklist-item:last-child {
  border-bottom: none;
}
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
  transition: all .15s;
}
.check-btn.done {
  background: var(--accent);
  border-color: var(--accent);
}
.check-icon {
  color: var(--on-primary);
  font-size: .75rem;
  font-weight: 700;
}
.check-label {
  font-size: .875rem;
  color: var(--text);
}
.check-label.done {
  color: var(--text-muted);
  text-decoration: line-through;
}
</style>
