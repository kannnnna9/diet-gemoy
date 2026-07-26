<template>
  <div class="splash">
    <div class="splash-inner">
      <h1 class="splash-title">Diet Gemoy</h1>
      <p class="splash-subtitle">Biar tambah gemoy, tapi sehat</p>
      <div class="splash-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  z-index: 2000;
}
.splash-inner {
  text-align: center;
}
.splash-title {
  font-family: var(--font-head);
  font-size: 2rem;
  color: var(--primary);
  margin: 0 0 4px;
}
.splash-subtitle {
  font-size: .875rem;
  color: var(--text-muted);
  margin: 0 0 24px;
}
.splash-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-soft);
  animation: bounce 1.4s infinite ease-in-out both;
}
.dot:nth-child(1) { animation-delay: -.32s; }
.dot:nth-child(2) { animation-delay: -.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
