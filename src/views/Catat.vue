<template>
  <div class="page">
    <h2 class="page-title">Catat</h2>
    <CatatBB />
    <CatatUkuran />
    <FotoProgres />
  </div>
</template>

<script setup>
import CatatBB from '../components/CatatBB.vue'
import CatatUkuran from '../components/CatatUkuran.vue'
import FotoProgres from '../components/FotoProgres.vue'
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  margin-bottom: 16px;
}
</style>
