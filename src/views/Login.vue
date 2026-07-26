<template>
  <div class="login-portal" :data-theme="tema">
    <div class="hero">
      <Sprout :size="40" class="hero-icon" />
      <h1 class="hero-title">Diet Gemoy</h1>
    </div>

    <div class="body">
      <p class="tagline">Teman diet kamu &amp; pasangan, di satu tempat.</p>

      <template v-if="!auth.ditolak">
        <button class="login-btn" @click="auth.loginGoogle()">
          <span class="g-badge">G</span> Masuk dengan Google
        </button>
        <p class="footnote">Privat untuk kalian berdua</p>
      </template>

      <template v-else>
        <p class="tolak">Akun ini tidak terdaftar. Diet Gemoy privat untuk 2 orang.</p>
        <button class="keluar-btn" @click="auth.logout()">Keluar &amp; coba akun lain</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Sprout } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { pilihTemaLogin } from '../lib/loginTheme'

const auth = useAuthStore()
const tema = pilihTemaLogin()
</script>

<style scoped>
.login-portal {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
.hero {
  background: var(--primary);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  padding: 64px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.hero-icon { color: var(--bg); }
.hero-title {
  font-family: var(--font-head);
  font-size: 1.9rem;
  color: #fff;
  font-weight: 600;
}
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 28px 40px;
  gap: 20px;
  text-align: center;
}
.tagline {
  font-size: .95rem;
  color: var(--text-muted);
  max-width: 280px;
}
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--primary);
  color: #fff;
  font-weight: 700;
  font-size: .95rem;
  padding: 13px 22px;
  border-radius: var(--r-md);
  width: 100%;
  max-width: 320px;
}
.g-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  color: var(--primary);
  font-weight: 800;
  font-size: .8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footnote {
  font-size: .75rem;
  color: var(--text-muted);
}
.tolak {
  font-size: .875rem;
  color: var(--danger);
  max-width: 300px;
}
.keluar-btn {
  color: var(--primary);
  font-weight: 700;
  text-decoration: underline;
  font-size: .875rem;
}
</style>
