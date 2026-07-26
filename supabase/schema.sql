-- Diet Gemoy — Fase 2: skema DB + RLS.
-- Dokumentasi (sumber kebenuran). SQL ini sudah dijalankan Reza di SQL Editor Supabase.
-- Idempoten: aman dijalankan ulang (create table if not exists, policy dibuat sekali).

-- profiles: 1 baris per user, memetakan email -> profil_id + pasangan.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  profil_id text not null check (profil_id in ('paypey','ffazeyall')),
  nama text,
  pasangan_user_id uuid references auth.users(id)
);

-- tracking: data angka (LWW via updated_at), 1 baris per jenis per tanggal per user.
create table if not exists public.tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profil_id text not null,
  jenis text not null check (jenis in ('bb','ukuran','checklist')),
  tanggal date not null,
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, jenis, tanggal)
);

alter table public.profiles enable row level security;
alter table public.tracking enable row level security;

-- profiles: semua user login boleh SELECT (perlu baca profil pasangan); UPDATE hanya diri sendiri.
create policy "profiles_select_auth" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (user_id = auth.uid());

-- tracking: tulis hanya milik sendiri.
create policy "tracking_insert_own" on public.tracking
  for insert to authenticated with check (user_id = auth.uid());
create policy "tracking_update_own" on public.tracking
  for update to authenticated using (user_id = auth.uid());

-- tracking: baca milik sendiri ATAU milik pasangan.
create policy "tracking_select_own_or_partner" on public.tracking
  for select to authenticated using (
    user_id = auth.uid()
    or user_id = (select pasangan_user_id from public.profiles where user_id = auth.uid())
  );

-- =====================================================================
-- SEED profiles (template) — jalankan SETELAH kedua orang login Google sekali,
-- agar user_id tersedia di auth.users. Ganti placeholder sesuai data nyata.
-- =====================================================================
-- insert into public.profiles (user_id, email, profil_id) values
--   ('<uid-suami>', '<gmail-suami>', 'paypey'),
--   ('<uid-istri>', '<gmail-istri>', 'ffazeyall')
-- on conflict (user_id) do update set
--   profil_id = excluded.profil_id,
--   email      = excluded.email;
--
-- update public.profiles set pasangan_user_id = '<uid-istri>' where profil_id = 'paypey';
-- update public.profiles set pasangan_user_id = '<uid-suami>' where profil_id = 'ffazeyall';
