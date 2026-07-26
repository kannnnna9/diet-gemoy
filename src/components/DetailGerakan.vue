<template>
  <div class="detail">
    <div v-for="(step, i) in gerakan.langkah" :key="i" class="step">
      <span class="step-num">{{ i + 1 }}</span>
      <span>{{ step }}</span>
    </div>
    <div v-if="gerakan.cue?.length" class="cue">
      <div v-for="(c, i) in gerakan.cue" :key="i" class="cue-item">{{ c }}</div>
    </div>
    <a
      v-if="gerakan.media?.video"
      :href="gerakan.media.video"
      target="_blank"
      rel="noopener"
      class="btn-video"
    >Lihat video</a>
    <a
      v-else
      :href="youtubeSearchUrl(gerakan.nama)"
      target="_blank"
      rel="noopener"
      class="btn-video btn-video-cari"
    >
      Cari di YouTube
    </a>
  </div>
</template>

<script setup>
import { youtubeSearchUrl } from '../lib/videoLink'

defineProps({
  gerakan: { type: Object, required: true },
})
</script>

<style scoped>
.step {
  display: flex;
  gap: 8px;
  font-size: .8125rem;
  padding: 4px 0;
}
.step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .6875rem;
  font-weight: 600;
  flex-shrink: 0;
}
.cue {
  margin-top: 8px;
  padding: 8px;
  background: var(--bg);
  border-radius: var(--r-sm);
}
.cue-item {
  font-size: .75rem;
  color: var(--text-muted);
  font-style: italic;
}
.btn-video {
  display: inline-block;
  margin-top: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: var(--r-sm);
  font-size: .75rem;
  font-weight: 600;
}
.btn-video-cari {
  border-color: var(--text-muted);
  color: var(--text-muted);
}
</style>
