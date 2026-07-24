<template>
  <div>
    <section class="card">
      <h3 class="card-title">Aturan Makan Harian</h3>
      <p class="text-sm text-muted intro">
        {{ am.polaMakan === 'ganjel-pagi' ? 'Ganjel pagi WAJIB — makan kecil sebelum kerja.' : 'IF window ' + am.window + ' — makan hanya di rentang ini.' }}
      </p>

      <div class="timeline">
        <div v-for="(slot, i) in am.slot" :key="i" class="tl-row">
          <div class="tl-marker">
            <span class="tl-dot"></span>
            <span v-if="i < am.slot.length - 1" class="tl-line"></span>
          </div>
          <div class="tl-content">
            <span class="tl-time">{{ slot.waktu }}</span>
            <strong class="tl-nama">{{ slot.nama }}</strong>
            <span class="tl-kkal">{{ slot.kkal }} kkal</span>
            <p v-if="slot.catatan" class="tl-catatan">{{ slot.catatan }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">Aturan Piring</h3>
      <div class="bars">
        <div v-for="(p, i) in am.piring" :key="i" class="bar-row">
          <div class="bar-top">
            <span class="bar-nama"><span class="bar-ikon">{{ ikonGrup[p.grup] }}</span> {{ p.nama }}</span>
            <span class="bar-takaran">{{ p.takaran }}</span>
          </div>
          <div class="track">
            <div class="fill" :style="{ width: p.proporsi + '%', background: 'var(--food-' + p.grup + ')' }"></div>
          </div>
        </div>
      </div>
      <div v-for="(ct, i) in (am.catatan || [])" :key="'c' + i" class="catatan-item">
        <span class="bullet">•</span> {{ ct }}
      </div>
    </section>

    <section v-if="contoh.length" class="card">
      <h3 class="card-title">Contoh Nyata</h3>
      <p class="text-sm text-muted intro">Contoh porsi — sesuaikan seleramu, bukan menu wajib.</p>
      <div v-for="(c, i) in contoh" :key="i" class="meal">
        <div class="meal-time"><span class="meal-badge">{{ c.label }}</span></div>
        <div class="meal-body">{{ c.isi }}</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfileStore } from '../stores/profile'
import { getProgram } from '../data/program'

const profile = useProfileStore()
const prog = getProgram()

const am = computed(() =>
  prog.aturanMakan[profile.profilAktif] || { slot: [], catatan: [], piring: [] }
)
const contoh = computed(() => am.value.rotasiContoh?.isi || [])

const ikonGrup = { protein: '🖐️', sayur: '✊', karbo: '✊', lemak: '👍' }
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
.intro { margin-bottom: 12px; }
.text-sm { font-size: .8125rem; }
.text-muted { color: var(--text-muted); }

.timeline { display: flex; flex-direction: column; }
.tl-row { display: flex; gap: 12px; }
.tl-marker { display: flex; flex-direction: column; align-items: center; }
.tl-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  margin-top: 4px;
  flex-shrink: 0;
}
.tl-line { flex: 1; width: 2px; background: var(--line); margin: 2px 0; }
.tl-content { padding-bottom: 16px; display: flex; flex-direction: column; gap: 2px; }
.tl-time { font-size: .75rem; color: var(--primary); font-weight: 600; }
.tl-nama { font-size: .9375rem; }
.tl-kkal { font-size: .75rem; color: var(--text-muted); }
.tl-catatan { font-size: .8125rem; color: var(--text-muted); margin-top: 2px; }

.catatan-item {
  font-size: .8125rem;
  color: var(--text-muted);
  padding: 4px 0;
}
.bullet { color: var(--primary); margin-right: 4px; }

.bars { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.bar-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
.bar-nama { font-size: .8125rem; font-weight: 600; }
.bar-ikon { margin-right: 2px; }
.bar-takaran { font-size: .75rem; color: var(--text-muted); }
.track { height: 9px; background: var(--surface); border-radius: 5px; overflow: hidden; }
.fill { height: 100%; border-radius: 5px; }

.meal { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.meal:last-child { border-bottom: none; padding-bottom: 0; }
.meal-time { flex: none; width: 58px; }
.meal-badge {
  display: inline-block;
  background: var(--surface);
  color: var(--primary);
  font-weight: 700;
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .3px;
  padding: 3px 6px;
  border-radius: 6px;
}
.meal-body { font-size: .8125rem; line-height: 1.45; }
</style>
