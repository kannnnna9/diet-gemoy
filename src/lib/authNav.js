// Navigasi mengikuti status auth.
// Guard router hanya jalan saat navigasi; sesi OAuth yang selesai secara async
// (kembali dari Google, tukar ?code jadi sesi) datang SETELAH guard memutuskan —
// tanpa aturan reaktif ini, user tersangkut di /login walau sudah terautentikasi.
export function perluKeBeranda(profilId, routeName) {
  return Boolean(profilId) && routeName === 'login'
}

// Kebalikannya: setelah logout, profil kosong sementara masih di halaman dalam app →
// tendang ke login. Guard hanya jalan saat navigasi, jadi logout in-place tak tertangkap.
export function perluKeLogin(profilId, routeName) {
  return !profilId && routeName !== 'login'
}
