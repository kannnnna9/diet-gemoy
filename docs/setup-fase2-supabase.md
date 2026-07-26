# Setup Fase 2 — Supabase + Google OAuth

Panduan setup backend Fase 2 (login Google + sync data antar-HP). Dipublikasi karena **anon key & Client ID aman terbuka** — perlindungan data dipegang RLS, bukan rahasia kredensial. File ini reproducibility: sebagian besar langkah sudah dilakukan (lihat catatan status per langkah).

> Source-of-truth skema SQL: `supabase/schema.sql`. Jalankan ulang aman (pakai `if not exists`).

## 1. Project Supabase

- Buat project baru di [supabase.com](https://supabase.com) (free tier cukup).
- **Project Settings → API**: salin `Project URL` + `anon` (`public`) key.
- **Status: SUDAH DILAKUKAN.**

## 2. Skema DB + RLS

- Buka **SQL Editor** Supabase → tempel isi `supabase/schema.sql` → **Run**.
- Akan membuat tabel `profiles` & `tracking`, mengaktifkan RLS, dan membuat policy:
  - `profiles`: semua user terautentikasi bisa `SELECT` (perlu baca profil pasangan); `UPDATE` hanya baris sendiri.
  - `tracking`: `INSERT`/`UPDATE` hanya `user_id = auth.uid()`; `SELECT` baris sendiri ATAU milik pasangan (lewat subquery `pasangan_user_id`).
- **Status: SUDAH DILAKUKAN.**

## 3. Google Cloud — OAuth Client

1. [Google Cloud Console](https://console.cloud.google.com/) → buat/seleksi project.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**, mode **Testing** (cukup untuk 2 orang).
   - Tambahkan 2 email Gmail sebagai **Test users**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** (Application type: **Web application**):
   - **Authorized JavaScript origins**: `https://kannnnna9.github.io` dan `http://localhost:4173` (untuk `vite preview` lokal).
   - **Authorized redirect URIs**: `https://<project-ref>.supabase.co/auth/v1/callback` (ganti `<project-ref>` sesuai project Supabase, ada di Project URL).
4. Salin **Client ID** & **Client Secret**.
- **Status: SUDAH DILAKUKAN.**

## 4. Supabase — Aktifkan provider Google

- **Authentication → Providers → Google**: enable, tempel Client ID + Secret.
- **Authentication → URL Configuration → Site URL** = `https://kannnnna9.github.io/diet-gemoy/`.
- **Status: SUDAH DILAKUKAN.**

## 5. Seed tabel `profiles` (menunggu 2 login pertama)

`user_id` baru tersedia di `auth.users` setelah tiap orang login Google sekali. Setelah kedua orang pernah masuk, jalankan di SQL Editor (ambil `user_id` dari `auth.users`):

```sql
-- Ganti placeholder <uid-suami>/<uid-istri>/<gmail-*> sesuai data nyata.
insert into public.profiles (user_id, email, profil_id) values
  ('<uid-suami>',  '<gmail-suami>',  'paypey'),
  ('<uid-istri>',  '<gmail-istri>',  'ffazeyall')
on conflict (user_id) do update set
  profil_id = excluded.profil_id,
  email      = excluded.email;

-- Tautkan kedua profil saling sebagai pasangan:
update public.profiles set pasangan_user_id = '<uid-istri>' where profil_id = 'paypey';
update public.profiles set pasangan_user_id = '<uid-suami>' where profil_id = 'ffazeyall';
```

- **Status: MENUNGGU REZA** — butuh kedua orang login sekali agar `user_id` terisi, baru seed dijalankan.

## 6. `.env` lokal & variabel CI

Lokal: buat `.env` di root proyek (sudah di-`.gitignore`, jangan commit):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

CI (GitHub Actions): tambahkan sebagai **repository variables** (bukan secret — anon key aman publik) di **Settings → Secrets and variables → Actions → Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Workflow `deploy.yml` menginjeksi kedua variabel ke langkah `npm run build` lewat blok `env:`.
- **Status: SUDAH DILAKUKAN** (`.env` lokal ada; CI variables sudah diset).

## 7. Catatan keamanan

- **Anon key & OAuth Client ID bersifat publik** — aman ada di client bundle / repo. Yang melindungi data user adalah **RLS**, bukan kerahasiaan key.
- **Client Secret** Google bersifat rahasia — jangan taruh di repo; hanya ditempel di dashboard Supabase.
- Whitelist email dipegang dua lapis: (a) OAuth consent screen "Test users", (b) baris di tabel `profiles`. User tanpa baris `profiles` login → app menolak via `auth.ditolak`.
- Mode **tanpa `.env`** (build Track-A only): `isSupabaseReady = false` → guard login di-bypass, app jalan seperti Fase 1 (data lokal, tanpa sync). Build tetap sukses.
