<div align="center">
  <img src="https://amplopin.web.id/vite.svg" alt="Amplopin Logo" width="80" height="80">
  <h1 align="center">Amplopin</h1>
  <p align="center">
    <strong>Aplikasi Pencatatan Amplop Keluarga Modern & Elegan</strong>
    <br/>
    <a href="https://amplopin.web.id">https://amplopin.web.id</a>
  </p>
</div>

---

**Amplopin** adalah aplikasi manajemen pencatatan amplop kekinian untuk acara keluarga, pernikahan, khitanan, hingga duka cita. Dengan Amplopin, kamu bisa melacak siapa saja yang sudah memberikan amplop (suka cita/duka) dan berapa yang harus dikembalikan (amplop keluar) untuk menjaga tali silaturahmi dengan baik. 

Dibangun dengan antarmuka yang cantik, responsif, dan performa tinggi berkat ekosistem modern **Vue 3** dan **Supabase**.

## 🚀 Fitur Utama

- 📊 **Dasbor Cerdas:** Ringkasan total amplop masuk dan keluar, dikategorikan antara Suka Cita dan Duka.
- 👥 **Buku Kontak Terintegrasi:** Simpan semua tamu undangan dan kontak secara terpusat dengan fitur pencarian cepat.
- 💵 **Riwayat Transaksi:** Lacak detail setiap transaksi yang masuk/keluar. Termasuk fitur filter dan **Unduh Laporan ke PDF**.
- 🤝 **Laporan Amplop Masuk (Jejak Silaturahmi):** Pantau saldo timbal-balik per orang. Ketahui dengan pasti siapa yang sudah kamu "balas" undangannya.
- 📱 **Desain Mobile First & Glassmorphism:** UI/UX super mulus bak aplikasi _native_ di perangkat Android/iOS-mu.

## 🛠️ Teknologi yang Digunakan

- **Frontend:** [Vue 3](https://vuejs.org/) (Composition API) + [Vite](https://vitejs.dev/)
- **Routing & State:** Vue Router
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) dengan sentuhan Glassmorphism & Micro-animations
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **Deployment:** Vercel

---

## 💻 Cara Menjalankan di Lokal

### 1. Kloning dan Install Dependensi
```bash
git clone https://github.com/your-username/amplopin.git
cd amplopin
npm install
```

### 2. Konfigurasi Environment
Salin file environment dan masukkan kredensial Supabase milikmu:
```bash
cp .env.example .env.local
```
Buka `.env.local` dan isi dengan data dari **Settings -> API** di dashboard Supabase kamu:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

### 3. Persiapan Database (Supabase)
Pastikan kamu telah menjalankan skema database (tabel `kontak`, `transaksi`, beserta view dan _policies_ RLS) melalui SQL Editor di Supabase.

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka `http://localhost:5173` di browsermu dan rasakan kemulusannya! ✨

---

## 📂 Struktur Direktori

```text
src/
├── assets/          # Gambar, font, dan aset statis lainnya
├── components/      # Komponen UI Reusable (Modal, GlassSelect, Sidebar, BottomNav)
├── composables/     # Logic reaktif global (useAuth)
├── constants/       # Data statis seperti jenisAcara.js
├── router/          # Konfigurasi Vue Router & penjaga hak akses (Auth Guard)
├── views/           # Halaman utama aplikasi (Dashboard, Kontak, Riwayat, JejakSilaturahmi)
├── App.vue          # Root component
└── main.js          # Entry point aplikasi
```

## 🌍 Deployment

Aplikasi ini sudah dioptimasi untuk berjalan di Vercel:
1. Push repository ke GitHub.
2. Buat proyek baru di **Vercel** dan impor repositori.
3. Tambahkan Environment Variables (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`).
4. Klik **Deploy** dan Vercel akan otomatis mengenali Vite.

> Kunjungi aplikasi versi live di: **[amplopin.web.id](https://amplopin.web.id)**

---
<div align="center">
  Dibuat dengan ❤️ untuk mencatat silaturahmi yang lebih baik.
</div>
