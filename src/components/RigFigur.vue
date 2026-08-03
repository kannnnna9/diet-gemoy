<template>
  <svg :viewBox="'0 0 200 220'" role="img" class="rig" :aria-label="label">
    <rect width="200" height="220" fill="var(--surface)" />

    <line
      x1="20" :y1="KANVAS.lantai" x2="180" :y2="KANVAS.lantai"
      stroke="var(--line)" :style="sw(2)"
    />

    <!-- Urutan render PERSIS spec §4: belakang → depan -->

    <g :style="sw(STROKE.tungkai)" stroke="var(--primary-soft)" stroke-linecap="round">
      <line :x1="pose.akar.x" :y1="pose.akar.y" :x2="pose.lutut.jauh.x" :y2="pose.lutut.jauh.y" />
      <line :x1="pose.lutut.jauh.x" :y1="pose.lutut.jauh.y" :x2="pose.ankle.jauh.x" :y2="pose.ankle.jauh.y" />
    </g>
    <line
      :x1="pose.ankle.jauh.x" :y1="pose.ankle.jauh.y"
      :x2="pose.ujungJari.jauh.x" :y2="pose.ujungJari.jauh.y"
      :style="sw(STROKE.telapak)" stroke="var(--primary-soft)" stroke-linecap="round"
    />

    <g :style="sw(STROKE.lengan)" stroke="var(--primary-soft)" stroke-linecap="round">
      <line :x1="pose.bahu.x" :y1="pose.bahu.y" :x2="pose.siku.jauh.x" :y2="pose.siku.jauh.y" />
      <line :x1="pose.siku.jauh.x" :y1="pose.siku.jauh.y" :x2="pose.pergelanganTangan.jauh.x" :y2="pose.pergelanganTangan.jauh.y" />
    </g>

    <g :style="sw(STROKE.tungkai)" stroke="var(--primary)" stroke-linecap="round">
      <line :x1="pose.akar.x" :y1="pose.akar.y" :x2="pose.lutut.dekat.x" :y2="pose.lutut.dekat.y" />
      <line :x1="pose.lutut.dekat.x" :y1="pose.lutut.dekat.y" :x2="pose.ankle.dekat.x" :y2="pose.ankle.dekat.y" />
    </g>
    <line
      :x1="pose.ankle.dekat.x" :y1="pose.ankle.dekat.y"
      :x2="pose.ujungJari.dekat.x" :y2="pose.ujungJari.dekat.y"
      :style="sw(STROKE.telapak)" stroke="var(--primary)" stroke-linecap="round"
    />

    <line
      :x1="pose.akar.x" :y1="pose.akar.y" :x2="pose.leherBawah.x" :y2="pose.leherBawah.y"
      :style="sw(STROKE.torso)" stroke="var(--primary)" stroke-linecap="round"
    />

    <line
      :x1="pose.leherBawah.x" :y1="pose.leherBawah.y" :x2="pose.kepalaPusat.x" :y2="pose.kepalaPusat.y"
      :style="sw(STROKE.leher)" stroke="var(--primary)" stroke-linecap="round"
    />

    <circle :cx="pose.kepalaPusat.x" :cy="pose.kepalaPusat.y" :r="TULANG.kepalaR" fill="var(--primary)" />

    <line
      :x1="tepiHidung.x" :y1="tepiHidung.y" :x2="pose.hidungUjung.x" :y2="pose.hidungUjung.y"
      :style="sw(STROKE.hidung)" stroke="var(--primary)" stroke-linecap="round"
    />

    <g :style="sw(STROKE.lengan)" stroke="var(--primary)" stroke-linecap="round">
      <line :x1="pose.bahu.x" :y1="pose.bahu.y" :x2="pose.siku.dekat.x" :y2="pose.siku.dekat.y" />
      <line :x1="pose.siku.dekat.x" :y1="pose.siku.dekat.y" :x2="pose.pergelanganTangan.dekat.x" :y2="pose.pergelanganTangan.dekat.y" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { STROKE, TULANG, KANVAS } from '../lib/rig.js'

const props = defineProps({
  pose: { type: Object, required: true },
  strokeSkala: { type: Number, default: 1 },
  label: { type: String, default: 'Peraga gerakan' },
})

// Titik di tepi kepala tempat hidung menempel (arah = kepalaPusat → hidungUjung).
const tepiHidung = computed(() => {
  const dx = props.pose.hidungUjung.x - props.pose.kepalaPusat.x
  const dy = props.pose.hidungUjung.y - props.pose.kepalaPusat.y
  const len = Math.hypot(dx, dy) || 1
  return {
    x: props.pose.kepalaPusat.x + (dx / len) * TULANG.kepalaR,
    y: props.pose.kepalaPusat.y + (dy / len) * TULANG.kepalaR,
  }
})

// Ketebalan dari STROKE (rig.js) × strokeSkala × --rig-stroke (penyetelan global).
const sw = (px) => ({
  strokeWidth: `calc(${px * props.strokeSkala}px * var(--rig-stroke, 1))`,
})
</script>

<style scoped>
.rig {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
