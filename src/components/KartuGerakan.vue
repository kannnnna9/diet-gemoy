<template>
  <div class="kartu" :class="{ risiko: showRisiko }">
    <div class="kartu-header">
      <h4 class="kartu-nama">{{ gerakan.nama }}</h4>
      <span class="kartu-kategori">{{ gerakan.kategori }}</span>
    </div>

    <div v-if="showRisiko" class="kartu-risiko">
      <span class="risiko-badge">⚠️ Perhatian Lutut</span>
      <p class="risiko-note">{{ gerakan.catatanLutut || aturanLutut.prinsip }}</p>
      <button
        v-if="gerakan.penggantiId"
        class="btn-ganti"
        @click="$emit('ganti', gerakan.penggantiId)"
      >
        Ganti aman: {{ gerakanPengganti?.nama || gerakan.penggantiId }}
      </button>
    </div>

    <div class="kartu-media">
      <img
        v-if="fotoUrl"
        :src="fotoUrl"
        :alt="gerakan.nama"
        class="kartu-foto"
        @error="fotoUrl = null"
      />
      <div v-else class="kartu-placeholder">
        <span class="placeholder-icon">🏋️</span>
        <span class="placeholder-text">Foto belum tersedia</span>
      </div>
    </div>

    <div class="kartu-body">
      <DetailGerakan :gerakan="gerakan" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProgram, getGerakan } from '../data/program'
import DetailGerakan from './DetailGerakan.vue'

const props = defineProps({
  gerakan: { type: Object, required: true },
})

defineEmits(['ganti'])

const profile = useProfileStore()
const prog = getProgram()

const fotoUrl = ref(null)
const aturanLutut = computed(() => prog.aturanLutut || {})

// Risiko lutut hanya untuk profil yang diatur di data (paypey), berbasis flag gerakan.
const showRisiko = computed(() => {
  return aturanLutut.value.berlakuUntuk === profile.profilAktif && props.gerakan.risikoLutut
})

const gerakanPengganti = computed(() => {
  if (!props.gerakan.penggantiId) return null
  return getGerakan(props.gerakan.penggantiId)
})

onMounted(async () => {
  const id = props.gerakan.id
  const base = import.meta.env.BASE_URL || './'
  try {
    const resp = await fetch(`${base}gerakan/${id}.jpg`)
    if (resp.ok) fotoUrl.value = `${base}gerakan/${id}.jpg`
  } catch {
    // fallback: placeholder tetap tampil
  }
})
</script>

<style scoped>
.kartu {
  background: var(--card);
  border-radius: var(--r-md);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--line);
}
.kartu.risiko {
  border-color: var(--danger);
}
.kartu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px 0;
}
.kartu-nama {
  font-size: 1rem;
}
.kartu-kategori {
  font-size: .6875rem;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--text-muted);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 99px;
}
.kartu-risiko {
  margin: 8px 12px 0;
  padding: 10px;
  background: var(--warn-bg);
  border-radius: var(--r-sm);
  border: 1px solid var(--warn-line);
}
.risiko-badge {
  font-size: .75rem;
  font-weight: 700;
  color: var(--danger);
}
.risiko-note {
  font-size: .75rem;
  color: var(--text-muted);
  margin-top: 4px;
}
.btn-ganti {
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--r-sm);
  font-size: .75rem;
  font-weight: 600;
}
.kartu-media {
  margin: 8px 12px 0;
  border-radius: var(--r-sm);
  overflow: hidden;
}
.kartu-foto {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: var(--surface);
}
.kartu-placeholder {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  gap: 4px;
}
.placeholder-icon {
  font-size: 1.5rem;
  opacity: .5;
}
.placeholder-text {
  font-size: .75rem;
  color: var(--text-muted);
}
.kartu-body {
  padding: 12px;
}
</style>
