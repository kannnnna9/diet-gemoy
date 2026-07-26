<template>
  <Teleport to="body">
    <div
      class="overlay"
      @click="$emit('batal')"
      @keydown.esc="$emit('batal')"
      role="dialog"
      aria-modal="true"
    >
      <div class="kartu" @click.stop>
        <h3 class="judul">{{ judul }}</h3>
        <div class="isi"><slot /></div>
        <div class="aksi">
          <button class="btn-batal" @click="$emit('batal')">{{ labelBatal }}</button>
          <button class="btn-ya" @click="$emit('konfirmasi')" ref="tombolYa">{{ labelYa }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  judul: { type: String, required: true },
  labelYa: { type: String, default: 'Ya, simpan' },
  labelBatal: { type: String, default: 'Periksa lagi' },
})

defineEmits(['konfirmasi', 'batal'])

const tombolYa = ref(null)

onMounted(() => {
  tombolYa.value?.focus()
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.kartu {
  background: var(--card);
  color: var(--text);
  border-radius: var(--r-md);
  padding: 24px;
  max-width: 360px;
  width: 100%;
  box-shadow: var(--shadow-soft);
}
.judul {
  font-size: 1rem;
  margin-bottom: 12px;
}
.isi {
  font-size: .875rem;
  color: var(--text-muted);
  margin-bottom: 20px;
  line-height: 1.5;
}
.aksi {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn-batal {
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: .8125rem;
  font-weight: 600;
}
.btn-ya {
  padding: 8px 16px;
  border: none;
  border-radius: var(--r-sm);
  background: var(--primary);
  color: var(--on-primary);
  font-size: .8125rem;
  font-weight: 600;
}
</style>
