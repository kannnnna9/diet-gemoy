// Navigasi mengikuti status auth.
// Guard router hanya jalan saat navigasi; sesi OAuth yang selesai secara async
// (kembali dari Google, tukar ?code jadi sesi) datang SETELAH guard memutuskan —
// tanpa aturan reaktif ini, user tersangkut di /login walau sudah terautentikasi.
export function perluKeBeranda(profilId, routeName) {
  return Boolean(profilId) && routeName === 'login'
}
