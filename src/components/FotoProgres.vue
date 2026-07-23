<template>
  <div class="card">
    <h3 class="card-title">Foto Progres</h3>

    <div class="upload-row">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="input-file"
        @change="upload"
      />
      <button class="btn" @click="$refs.fileInput.click()">Pilih foto</button>
    </div>

    <p class="privacy-note">Foto tersimpan hanya di HP ini.</p>

    <div v-if="loading" class="loading">Memuat...</div>

    <div v-if="fotoList.length" class="gallery">
      <div v-for="f in fotoList" :key="f.id" class="gallery-item">
        <img :src="f.url" alt="Foto progres" class="gallery-img" />
        <div class="gallery-info">
          <span class="text-sm">{{ f.tanggal }}</span>
          <button class="btn-del" @click="hapus(f.tanggal)">Hapus</button>
        </div>
      </div>
    </div>
    <p v-else-if="!loading" class="text-sm text-muted">Belum ada foto progres.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useProfileStore } from '../stores/profile'
import { usePhotosStore } from '../stores/photos'

const profile = useProfileStore()
const photos = usePhotosStore()

const fotoList = ref([])
const loading = ref(false)
const fileInput = ref(null)

async function muat() {
  loading.value = true
  const list = await photos.daftar()
  fotoList.value = await Promise.all(
    list.map(async f => {
      const entry = await photos.ambil(f.tanggal)
      const url = entry?.blob ? URL.createObjectURL(entry.blob) : null
      return { ...f, url }
    })
  )
  loading.value = false
}

async function upload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const tanggal = new Date().toISOString().slice(0, 10)
  await photos.simpan(tanggal, file, '')
  await muat()
}

async function hapus(tanggal) {
  await photos.hapus(tanggal)
  await muat()
}

watch(() => profile.profilAktif, muat)
onMounted(muat)
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
  margin-bottom: 12px;
}
.upload-row {
  margin-bottom: 8px;
}
.input-file {
  display: none;
}
.btn {
  padding: 8px 16px;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--r-sm);
  font-weight: 600;
  font-size: .875rem;
}
.privacy-note {
  font-size: .75rem;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 12px;
}
.loading {
  font-size: .875rem;
  color: var(--text-muted);
  padding: 8px 0;
}
.gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.gallery-item {
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  overflow: hidden;
}
.gallery-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: var(--surface);
}
.gallery-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg);
}
.btn-del {
  font-size: .75rem;
  color: var(--danger);
  font-weight: 600;
}
.text-sm {
  font-size: .8125rem;
}
.text-muted {
  color: var(--text-muted);
}
</style>
