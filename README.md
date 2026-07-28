# Amplopin — Vue 3 + Supabase

Aplikasi pencatatan amplop keluarga. Dibangun dengan Vue 3 (Composition API), Vue Router, Tailwind CSS, dan Supabase.

## Menjalankan di lokal

```bash
npm install
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial project Supabase kamu (Settings -> API di dashboard Supabase):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

Lalu jalankan:

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Struktur folder

```
src/
  lib/supabase.js         -> inisialisasi Supabase client
  composables/useAuth.js  -> state login global (signUp, signIn, signOut)
  router/index.js         -> routing + guard (halaman privat butuh login)
  constants/jenisAcara.js -> daftar default jenis acara & kategori
  views/
    Login.vue
    Signup.vue
    Dashboard.vue           -> ringkasan total masuk/keluar per kategori
    Kontak.vue              -> buku kontak + live search + tambah kontak
    TransaksiBaru.vue       -> catat amplop masuk/keluar (search & select kontak)
    JejakSilaturahmi.vue    -> saldo timbal-balik per kontak
  components/BottomNav.vue  -> navigasi bawah ala aplikasi mobile
```

## Prasyarat database

Project ini mengasumsikan skema database Supabase sudah dijalankan
(`001_schema.sql`, `002_rls_policies.sql`, `003_functions_and_views.sql`)
dari paket migrasi Amplopin sebelumnya. Tanpa itu, query ke tabel
`kontak`, `transaksi`, dan view `v_ringkasan_keluarga` /
`v_jejak_silaturahmi` akan gagal.

## Deploy ke Vercel

1. Push project ini ke GitHub.
2. Import repo di vercel.com -> New Project.
3. Tambahkan Environment Variables yang sama seperti `.env.local`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) di Project Settings.
4. Deploy -- Vercel otomatis mendeteksi Vite dan build dengan `npm run build`.

## Lanjut development di Antigravity / VS Code / IDE lain

Folder ini adalah project Vite standar -- cukup buka foldernya di IDE
pilihanmu, jalankan `npm install`, dan lanjutkan menambah fitur (misal
edit/hapus transaksi, export Excel/CSV, halaman detail riwayat per
kontak) sesuai roadmap di PRD.
