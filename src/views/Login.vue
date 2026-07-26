<template>
  <div class="login-page">
    <h1 class="login-title">Diet Gemoy</h1>
    <p class="login-sub">Masuk untuk sinkron &amp; lihat progres pasangan.</p>
    <button class="login-btn" @click="auth.loginGoogle()">Masuk dengan Google</button>
    <p v-if="auth.ditolak" class="login-tolak">
      Akun ini tidak terdaftar. Diet Gemoy privat untuk 2 orang.
      <button class="login-tolak-btn" @click="auth.logout()">Keluar</button>
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px;
}
.login-title {
  font-family: var(--font-head);
  font-size: 2rem;
  color: var(--primary);
}
.login-sub {
  color: var(--text-muted);
  font-size: .9rem;
}
.login-btn {
  background: var(--primary);
  color: var(--on-primary);
  font-weight: 700;
  padding: 12px 20px;
  border-radius: var(--r-md);
  font-size: .95rem;
}
.login-tolak {
  color: var(--danger);
  font-size: .85rem;
  margin-top: 12px;
  max-width: 320px;
}
.login-tolak-btn {
  margin-left: 6px;
  color: var(--primary);
  font-weight: 600;
  text-decoration: underline;
}
</style>
