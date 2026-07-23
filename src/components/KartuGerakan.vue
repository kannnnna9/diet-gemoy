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
      <div v-for="(step, i) in gerakan.langkah" :key="i" class="kartu-step">
        <span class="step-num">{{ i + 1 }}</span>
        <span>{{ step }}</span>
      </div>
      <div v-if="gerakan.cue?.length" class="kartu-cue">
        <div v-for="(c, i) in gerakan.cue" :key="i" class="cue-item">{{ c }}</div>
      </div>
      <a
        v-if="gerakan.media?.video"
        :href="gerakan.media.video"
        target="_blank"
        rel="noopener"
        class="btn-video"
      >
        Lihat video
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProgram, getGerakan } from '../data/program'

const props = defineProps({
  gerakan: { type: Object, required: true },
})

defineEmits(['ganti'])

const profile = useProfileStore()
const prog = getProgram()

const fotoUrl = ref(null)

const showRisiko = computed(() => {
  return profile.profilAktif === 'paypey' && props.gerakan.risikoLutut
})

const aturanLutut = computed(() => prog.aturanLutut || {})

const gerakanPengganti = computed(() => {
  if (!props.gerakan.penggantiId) return null
  return getGerakan(props.gerakan.penggantiId)
})

onMounted(async () => {
  const id = props.gerakan.id
  const base = import.meta.env.BASE_URL || './'
  try {
    const resp = await fetch(`${base}gerakan/${id}.jpg`)
    if (resp.ok) {
      fotoUrl.value = `${base}gerakan/${id}.jpg`
    }
  } catch {
    // fallback
  }
})
</script>

<style scoped>
.kartu {
  background: #fff;
  border-radius: var(--r-md);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--c-line);
}
.kartu.risiko {
  border-color: var(--c-danger);
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
  color: var(--c-ink-soft);
  background: var(--c-cream);
  padding: 2px 8px;
  border-radius: 99px;
}
.kartu-risiko {
  margin: 8px 12px 0;
  padding: 10px;
  background: #fef5e7;
  border-radius: var(--r-sm);
  border: 1px solid #f0d6b5;
}
.risiko-badge {
  font-size: .75rem;
  font-weight: 700;
  color: var(--c-danger);
}
.risiko-note {
  font-size: .75rem;
  color: var(--c-ink-soft);
  margin-top: 4px;
}
.btn-ganti {
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--c-terracotta);
  color: #fff;
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
  background: var(--c-cream-2);
}
.kartu-placeholder {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--c-cream-2);
  gap: 4px;
}
.placeholder-icon {
  font-size: 1.5rem;
  opacity: .5;
}
.placeholder-text {
  font-size: .75rem;
  color: var(--c-ink-soft);
}
.kartu-body {
  padding: 12px;
}
.kartu-step {
  display: flex;
  gap: 8px;
  font-size: .8125rem;
  padding: 4px 0;
}
.step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--c-cream-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .6875rem;
  font-weight: 600;
  flex-shrink: 0;
}
.kartu-cue {
  margin-top: 8px;
  padding: 8px;
  background: var(--c-cream);
  border-radius: var(--r-sm);
}
.cue-item {
  font-size: .75rem;
  color: var(--c-ink-soft);
  font-style: italic;
}
.btn-video {
  display: inline-block;
  margin-top: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--c-terracotta);
  color: var(--c-terracotta);
  border-radius: var(--r-sm);
  font-size: .75rem;
  font-weight: 600;
}
</style>
