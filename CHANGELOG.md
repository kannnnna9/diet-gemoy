# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/) & [SemVer](https://semver.org/).

## [1.1.2] — 2026-07-26

### Diperbaiki
- Login tersangkut di portal setelah pilih akun Google (regresi v1.1.1): navigasi kini bereaksi saat sesi OAuth selesai secara async — begitu login sukses, langsung pindah ke beranda. Sebelumnya bergantung pada bottom-nav yang hilang di layar login full-screen.

## [1.1.1] — 2026-07-26

### Diubah
- Layar login jadi portal full-screen berdiri sendiri (tanpa header & bottom-nav).
- Desain login "Hero Organik" dengan palet warna acak tiap dibuka: Matcha (suami) atau Cranberry (istri).

## [1.1.0] — 2026-07-26

### Ditambahkan
- Login Google wajib (whitelist 2 akun via tabel `profiles`; email tak terdaftar ditolak).
- Sinkron data antar-HP: BB, ukuran, checklist (last-write-wins). Foto badan tetap lokal (tidak ikut sync, demi privasi).
- Panel "Pasangan" read-only: lihat BB terkini & ringkasan checklist pasangan.
- Antrean sync offline: perubahan saat offline dikirim otomatis saat online lagi.

### Catatan
- App tetap jalan tanpa kredensial Supabase (mode lokal Fase 1) untuk fork/dev.
- Arsitektur sync via satu pintu (`lib/sync.js`) agar mudah dimigrasikan ke Supabase-primary nanti.

## [1.0.2] — 2026-07-25

### Ditambahkan
- Kartu reminder "Sekarang waktunya" di Beranda: tampil dalam 90 menit setelah jam slot (ganjel, IF, snack, latihan, dst) + tombol nudge "Ingatkan aku" untuk pasang alarm HP sendiri.
- Tombol "Export ke Kalender (.ics)" di Pengaturan: unduh file jadwal jam-ketat berulang → impor ke Google Kalender, notif ditangani Google. Nol login tambahan.
- Blok data `slotHarian` per profil (jam penting terstruktur, diambil dari dokumen program).

## [1.0.1] — 2026-07-25

### Diperbaiki
- Checklist "Hari Ini" kini langsung tercoret saat diklik (sebelumnya harus refresh dulu).
- Toggle "Lagi haid" (profil ffazeyall) kini langsung memunculkan banner & mengoreksi kalori tanpa refresh.

### Diubah
- Kartu "Fokus 2 minggu pertama" jadi daftar poin biasa (bukan checklist). Badge hitungan hari & tombol Sembunyikan tetap.

## [1.0.0] — 2026-07-23

- Rilis awal Fase 1 (local-first, tanpa kredensial): beranda, program per fase, checklist harian,
  catat BB/ukuran, foto progres lokal, katalog gerakan (C-Hybrid), mode haid, pantangan lutut.
- Iterasi pra-launch (belum dinaikkan versinya): revisi 4 poin (tanggal fase, jadwal actionable,
  tab makan, 2 tema per profil) & revisi UI Program (stepper fase, bar takaran).
