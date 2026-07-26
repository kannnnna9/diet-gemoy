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

// Tujuan setelah sesi OAuth selesai (profilId terisi) saat pengguna masih di /login.
// Jika ada redirect valid dari query string (hasil tendang guard di refresh), kembali ke situ.
// Jika tidak, fallback ke beranda.
export function tujuanSetelahLogin(routeName, redirectQuery, ruteDikenal) {
  if (routeName !== 'login') return null
  if (
    redirectQuery &&
    redirectQuery.startsWith('/') &&
    !redirectQuery.startsWith('//') &&
    !redirectQuery.includes('http') &&
    ruteDikenal.includes(redirectQuery)
  ) {
    return redirectQuery
  }
  return { name: 'beranda' }
}
