<template>
  <div v-if="gerakan" class="item" :class="{ risiko: showRisiko }">
    <button class="item-head" @click="terbuka = !terbuka">
      <span class="item-nama">
        {{ gerakan.nama }}
        <span v-if="showRisiko" class="badge-lutut">⚠ lutut</span>
      </span>
      <span class="item-dosis">{{ dosis }}</span>
      <span class="chev" :class="{ open: terbuka }">▾</span>
    </button>

    <div v-if="terbuka" class="item-body">
      <DetailGerakan :gerakan="gerakan" />

      <div v-if="showRisiko" class="ganti-wrap">
        <p class="ganti-note">{{ gerakan.catatanLutut || aturanLutut.prinsip }}</p>
        <button v-if="pengganti" class="btn-ganti" @click="showPengganti = !showPengganti">
          {{ showPengganti ? 'Tutup pengganti' : `Ganti aman: ${pengganti.nama}` }}
        </button>
        <div v-if="showPengganti && pengganti" class="pengganti-detail">
          <p class="pengganti-title">Pengganti aman — {{ pengganti.nama }}</p>
          <DetailGerakan :gerakan="pengganti" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProgram, getGerakan } from '../data/program'
import DetailGerakan from './DetailGerakan.vue'

const props = defineProps({
  gerakanId: { type: String, required: true },
  rep: { type: String, default: '' },   // string rep/target dari item
  set: { type: [Number, String], default: null }, // jumlah set dari sesi
})

const profile = useProfileStore()
const prog = getProgram()

const terbuka = ref(false)
const showPengganti = ref(false)

const gerakan = computed(() => getGerakan(props.gerakanId))
const aturanLutut = computed(() => prog.aturanLutut || {})

const showRisiko = computed(() =>
  aturanLutut.value.berlakuUntuk === profile.profilAktif && gerakan.value?.risikoLutut
)

const pengganti = computed(() => {
  const pid = gerakan.value?.penggantiId
  return pid ? getGerakan(pid) : null
})

// "3 × 10–15" bila ada set, atau cuma "10–15" / target ("60 dtk")
const dosis = computed(() => {
  if (!props.rep) return ''
  return props.set ? `${props.set} × ${props.rep}` : props.rep
})
</script>

<style scoped>
.item {
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  margin-bottom: 6px;
  overflow: hidden;
}
.item.risiko {
  border-color: var(--danger);
}
.item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  color: var(--text);
}
.item-nama {
  flex: 1;
  font-size: .875rem;
  font-weight: 600;
}
.badge-lutut {
  font-size: .6875rem;
  font-weight: 700;
  color: var(--danger);
  margin-left: 4px;
}
.item-dosis {
  font-size: .8125rem;
  color: var(--primary);
  font-weight: 600;
  white-space: nowrap;
}
.chev {
  color: var(--text-muted);
  transition: transform .15s;
}
.chev.open {
  transform: rotate(180deg);
}
.item-body {
  padding: 0 12px 12px;
  border-top: 1px solid var(--line);
  padding-top: 8px;
}
.ganti-wrap {
  margin-top: 8px;
  padding: 10px;
  background: var(--warn-bg);
  border: 1px solid var(--warn-line);
  border-radius: var(--r-sm);
}
.ganti-note {
  font-size: .75rem;
  color: var(--text-muted);
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
.pengganti-detail {
  margin-top: 8px;
}
.pengganti-title {
  font-size: .75rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}
</style>
