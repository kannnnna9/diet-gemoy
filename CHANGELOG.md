# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/) & [SemVer](https://semver.org/).

## [1.5.0] — 2026-08-05

### Ditambahkan
- **2 animasi gerakan**: `pushup`, `plank`. Total aset animasi 8 → 10.
  Dihasilkan agent Perigel, lolos validator 10/10 + **uji visual mata langsung**.

### Diperbaiki
- **Proses produksi aset**: batch percontoh (5+9 aset) terbukti menyelamatkan 
  dari produksi massal cacat. Validator 17/17 LOLOS angka, tapi pemeriksaan 
  visual menemukan **hanya 5 dari 17 yang benar-benar terbaca** (`squat-kursi`, 
  `march`, `pushup`, `plank`, `glute-bridge`). Temuan: **pose berbaring gagal 
  terbaca** — figur diputar 90° jadi garis patah horizontal, mata tak bisa 
  menyusun jadi sosok manusia. 12 aset gagal dihapus dari build. Produksi 
  ditahan sampai pendekatan pose berbaring diputuskan.

## [1.4.0] — 2026-08-04

### Ditambahkan
- **5 animasi gerakan pemanasan**: `march`, `arm-circle`, `hip-circle`,
  `hip-hinge`, `cat-cow`. Total aset animasi 3 → 8. Dihasilkan agent Perigel
  (data sudut sendi murni angka), diverifikasi validator + tinjauan manual.
- **Jenis kontak baru `merangkak`** untuk pose cat-cow & bird-dog. Penambatannya
  sama dengan `tangan-kaki`, tapi `torsoCondong` boleh −40..90 karena melengkung
  dua arah memang inti gerakannya. `tangan-kaki` (plank/push-up) TETAP ketat —
  sengaja dipisah supaya pagar bentuk plank tidak ikut hilang.

### Diperbaiki
- **Aturan validator "pusat massa jatuh" tidak lagi salah tuduh pose bertumpu
  satu kaki.** Sebelumnya setiap fleksi pinggul >30° dianggap pola squat dan
  menuntut badan condong, sehingga marching di tempat ditolak — padahal kaki
  tumpu yang menahan beban, badan memang tegak. Pembedanya kini apakah tungkai
  satunya menapak TEGAK (pinggul 0–20°, lutut <20°), bukan berapa sisi yang
  menekuk: single-leg RDL (tungkai belakang menjulur, pinggul negatif) TETAP
  wajib condong dan tetap ditolak kalau tidak.

## [1.3.1] — 2026-08-04

### Diubah
- **Koreksi instruksi gerakan hasil audit teknis 49 gerakan.** Perbaikan
  konten (`content/program.json`), tanpa perubahan kode.
  - Klaim "double chin" dihapus dari `wall-angel` & `chin-tuck` — spot reduction
    tidak didukung bukti; postur memperjelas garis rahang, bukan membakar lemak.
  - `heel-tap`: "tekuk pinggang ke samping" → "gerakkan rusuk turun ke panggul"
    (arah gerak sudah benar, diksinya menyesatkan).
  - `squat-kursi`: cue "lutut tidak melewati jari kaki" dibuang — membatasi lutut
    justru memindahkan beban ke panggul & punggung bawah.
  - `backpack-row`: varian Superman dipisah (beda bidang gerak & otot sasaran);
    alternatif tanpa alat diarahkan ke band pull-apart / prone Y-T.
  - `bicycle-lambat`, `single-arm-press`, `triceps-kickback`: cue diperbaiki agar
    menangkap kesalahan yang sebenarnya (tarikan leher, hiperekstensi lumbal).
  - `side-leg-raise`: pengganti "ganti aman" `dead-bug` → `clamshell` (sesama
    abduktor panggul; dead-bug melatih core, sasaran otot tidak nyambung).

### Ditambahkan
- Cue keamanan yang sebelumnya hilang: `plank` (napas & leher netral),
  `plank-shoulder-tap`, `rdl` (batas ROM), `floor-press` (set skapula),
  `band-face-pull` (rotasi eksternal), `reverse-crunch`.
- `vacuum`: kontraindikasi (hernia, hipertensi, gangguan jantung/paru, hamil)
  + batas tahan 10–15 detik. Berlaku kedua profil.

## [1.3.0] — 2026-08-03

### Ditambahkan
- **Peraga Gerak — animasi tutorial 3 gerakan** (rig 2D SVG, nol dependency):
  `squat-kursi`, `dead-bug`, `glute-bridge` kini dianimasikan di kartu gerakan.
  Satu rig figur bersendi dibangun sekali (`lib/rig.js` + `RigFigur.vue`); tiap
  gerakan hanyalah file JSON sudut sendi di `public/gerakan-anim/`.
- Penambatan lantai otomatis: posisi panggul dihitung dari sudut tungkai +
  bagian tubuh yang menyentuh lantai (kaki/punggung/sisi/tangan-kaki/bebas) —
  figur tidak pernah melayang maupun menembus lantai.
- Hemat baterai: animasi berhenti saat di luar layar (IntersectionObserver),
  saat tab tak aktif, dan tidak beranimasi sama sekali pada
  `prefers-reduced-motion: reduce` (pose statis). Maksimal satu animasi per layar.
- Validator aset `npm run validasi:anim` (dan test sapuan otomatis di vitest):
  menolak angka sendi di luar rentang, fisik yang mustahil, dan deep squat
  (≤95°) — pantangan lutut pengguna dijadikan default terkunci.
- Halaman uji `#/dev-rig` (dev-only): 10 slider sendi + rotasi + kontak +
  tombol salin JSON keyframe — alat menyetel angka LLM tanpa GUI animasi.

## [1.2.2] — 2026-07-28

### Diperbaiki
- Redirect OAuth Supabase kini tidak lagi membuat `router-view` blank saat login ulang setelah logout.
- URL hash OAuth yang terbaca sebagai path tidak dikenal ditangkap dan diarahkan ke beranda.

## [1.2.1] — 2026-07-26

### Diperbaiki
- Flash portal login saat refresh di halaman dalam app (catat/program/progres/dll) kini
  digantikan splash "Diet Gemoy" sesaat sebelum halaman tujuan tampil.
- Init auth tidak lagi early-return tanpa menunggu — cache promise memastikan
  `await auth.init()` di guard router benar-benar menunggu sesi selesai dipulihkan.

### Ditambahkan
- Komponen SplashLoading: layar penuh bertema dengan logo teks "Diet Gemoy" + animasi
  tiga dot, dirender selama auth belum siap.

### Diubah
- `auth.init()` pakai cache promise (ganti flag `_initStarted` boolean).

## [1.2.0] — 2026-07-26

### Ditambahkan
- **Redirect balik ke halaman asal** saat refresh: guard login kini menyertakan query `redirect` dengan path semula; setelah sesi OAuth pulih, navigasi mengembalikan ke halaman itu (bukan selalu beranda). Login beneran tetap mendarat di beranda.
- **Riwayat BB & Ukuran reaktif**: simpan BB/ukuran kini langsung tampil di daftar riwayat & grafik Progres tanpa perlu refresh. Ganti profil tetap benar.
- **Konfirmasi sebelum simpan BB & Ukuran**: dialog in-app (bertema) menampilkan ringkasan nilai; "Periksa lagi" membatalkan tanpa menyimpan, "Ya, simpan" menyimpan & langsung tampil.
- **Tombol "Cari di YouTube" fallback** untuk gerakan tanpa `media.video`: membuka hasil pencarian YouTube dengan nama gerakan langsung dari browser. Slot `media.video` khusus tetap menampilkan "Lihat video" bila terisi di masa depan.

### Diubah
- Reaktivitas store tracking mengikuti pola `checklists` (ref maps key per profil).

## [1.1.3] — 2026-07-26

### Diperbaiki
- Logout kini langsung mental ke portal login (sebelumnya masih tertahan di menu Pengaturan sampai refresh/pindah menu). Navigasi bereaksi saat profil kosong secara in-place — cermin dari perbaikan login v1.1.2.

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
