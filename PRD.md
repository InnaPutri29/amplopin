# Dokumen Persyaratan Produk (PRD) — Amplopin

**Nama Proyek:** Platform Amplopin — Aplikasi Web (SPA Responsif Mobile)
**Tumpukan Teknologi:** Vue.js 3 (Frontend), Tailwind CSS (UI/UX), Supabase (Database Backend & PostgreSQL), Vercel (Deployment)
**Versi:** 3.2 (Arsitektur SaaS — Final)
**Status:** Disetujui untuk pengembangan MVP

---

## 1. Latar Belakang

Dalam tradisi masyarakat Indonesia, memberikan amplop uang saat menghadiri berbagai acara (buwuhan/kondangan, duka cita, syukuran, dll.) merupakan bentuk ikatan sosial yang erat. Uang yang diberikan seringkali dianggap sebagai "titipan" atau "hutang sosial" yang harus dibalas (*reciprocity*) saat pemberi mengadakan acara di masa depan.

Buku tamu fisik dan catatan manual rawan hilang, rusak, atau sulit direkap secara akurat. Oleh karena itu, Amplopin hadir sebagai platform web berbasis SaaS (Software as a Service) yang memungkinkan berbagai keluarga (User) untuk mendigitalisasi catatan amplop mereka secara mandiri, aman, privat, dan terpusat di cloud.

---

## 2. Tujuan

- Menyediakan platform pencatatan amplop acara yang modern, fleksibel untuk berbagai jenis acara (pernikahan, duka cita, khitanan, syukuran, dll.), dan mudah diakses via HP oleh panitia atau keluarga.
- Menjamin privasi total data keuangan antar pengguna menggunakan sistem keamanan tingkat basis data (Row Level Security).
- Menyajikan kalkulasi otomatis status hubungan timbal-balik ("Jejak Silaturahmi") untuk mencegah salah paham dalam mengembalikan "titipan" amplop — dengan mempertimbangkan konteks budaya bahwa amplop duka cita tidak boleh diperlakukan sama seperti amplop suka cita.
- Membebaskan pemilik platform dari kerepotan mengurus data masing-masing keluarga berkat sistem pendaftaran mandiri.

---

## 3. Pengguna Sasaran (Target Audience)

| Peran | Deskripsi |
|---|---|
| **User (Keluarga / Pemilik Hajat)** | Masyarakat umum yang ingin mengelola pencatatan amplop masuk dan keluar untuk acara keluarga mereka sendiri secara privat. Satu akun mewakili satu keluarga — tidak ada fitur multi-user/invite anggota lain dalam satu tenant; siapa pun yang memegang akses akun (misal panitia acara) login menggunakan kredensial pemilik akun. |
| **Super Admin (Pengembang Platform)** | Pemilik aplikasi yang mengawasi operasional dan pertumbuhan sistem Amplopin secara keseluruhan (jumlah user terdaftar, status langganan/kuota, kesehatan sistem) tanpa pernah mengakses isi data keuangan/kontak privat milik keluarga pengguna. |

---

## 4. Fitur Utama (Core Features)

### A. Sistem Otentikasi & Multi-Tenant (Supabase Auth & RLS)

- **Registrasi & Login Mandiri:** Pengguna dapat mendaftarkan akun keluarga mereka menggunakan Email dan Password.
- **Isolasi Data (Privacy Guarantee):** Setiap keluarga memiliki ruang data sendiri. Berkat Row Level Security (RLS) di PostgreSQL, mustahil bagi Keluarga A melihat data amplop milik Keluarga B.
- **Model tenant:** 1 akun = 1 keluarga. Tidak ada fitur undang anggota lain ke tenant yang sama pada versi ini.
- Sebelum go-live, RLS policy wajib diuji eksplisit dengan skenario cross-tenant access (bukan sekadar diasumsikan aman).

### B. Buku Kontak Tamu & Relasi (Database Kontak)

- **Penyimpanan Terpusat:** Menyimpan Nama, Alamat/Kota, dan No. HP pemberi/penerima agar tidak terjadi duplikasi data saat mereka datang di acara berikutnya.
- **Field pembeda opsional:** `no_hp` dan `alamat_lengkap` bersifat **opsional**, berfungsi sebagai pembeda ketika ada nama yang identik/mirip (misal dua "Pak Budi" di RT berbeda). Jika kosong, sistem tetap berjalan — user melakukan konfirmasi manual saat memilih kontak.
- **Pencarian Cepat (Live Search):** Memfilter nama kontak secara instan di antarmuka Vue.js. Hasil pencarian menampilkan alamat/No. HP (jika tersedia) untuk membantu user membedakan kontak dengan nama serupa.
- **Pemilihan kontak wajib via search & select** — bukan input nama bebas (free text). Jika kontak belum ada, tersedia opsi "buat kontak baru" langsung dari form transaksi. Ini memastikan setiap transaksi selalu terhubung ke `kontak_id` yang konsisten, sehingga kalkulasi Jejak Silaturahmi akurat.

### C. Manajemen Transaksi Amplop (Penerimaan & Pengeluaran)

- **Pencatatan Masuk (Amplop Tamu):** Format input disesuaikan dengan kebiasaan buku tamu fisik: Nomor Urut (Otomatis, dihasilkan via sequence di database — bukan dihitung di frontend, untuk menghindari race condition saat input bersamaan), Nama (dari Buku Kontak), Jenis Acara, Kategori Acara, Nominal, Tanggal, dan Keterangan.
- **Pencatatan Keluar (Buwuhan/Sumbangan):** Mencatat amplop yang diberikan saat pengguna melayat atau menghadiri hajatan orang lain, dengan field yang sama.
- **CRUD Lengkap:** Pengguna dapat Menambah, Mengedit, dan Menghapus catatan keuangan mereka sendiri secara real-time tanpa reload halaman.
- **Riwayat per acara tetap tercatat:** Setiap transaksi menyimpan nama acara spesifik (misal "Nikahan Anak Pertama", "Nikahan Anak Kedua") dan tanggalnya, sehingga user bisa melihat kronologi lengkap saat membuka detail riwayat dengan seorang kontak — meskipun kalkulasi saldo bersifat kumulatif (lihat bagian D).

### D. Dasbor Finansial & "Jejak Silaturahmi"

- **Ringkasan Otomatis:** Menampilkan total akumulasi uang masuk dan uang keluar milik keluarga yang sedang login.
- **Kategori Acara — pemisahan saldo:** Setiap jenis acara diklasifikasikan ke salah satu dari dua kategori besar:
  - **Suka Cita** (pernikahan, khitanan, syukuran, dan acara gembira lainnya) — dihitung sebagai saldo timbal-balik penuh (plus/minus).
  - **Duka** (kematian/melayat) — dicatat sebagai riwayat, namun **tidak digabung** ke dalam saldo "hutang" acara suka cita, karena secara budaya amplop duka bersifat simpati/ta'ziah, bukan kewajiban balas nominal setara.
- **Rekapitulasi Hubungan ("Jejak Silaturahmi"):** Kalkulasi otomatis selisih (balance) **kumulatif sepanjang waktu (all-time)** dari total yang diterima dan yang diberikan kepada seseorang, difilter berdasarkan kategori acara (Suka Cita / Duka dihitung terpisah). Balance **tidak di-reset per acara** — transaksi baru dengan kontak yang sama akan menambah/mengurangi saldo yang sudah ada, mencerminkan sifat relasi sosial yang berkelanjutan antar dua keluarga.
- **Indikator Visual:** Membedakan secara jelas posisi saldo (minus, plus, atau seimbang) untuk memandu kepatutan pengembalian titipan di masa depan.

### E. Ekspor Laporan

- Pengguna dapat mengekspor data transaksi (dan/atau rekap Jejak Silaturahmi) ke format **Excel/CSV** untuk keperluan arsip pribadi atau pelaporan ke keluarga besar.
- Format PDF dapat dipertimbangkan pada fase berikutnya apabila dibutuhkan tampilan cetak yang lebih rapi.

---

## 5. Struktur Data (Ringkasan Konseptual)

| Tabel | Keterangan |
|---|---|
| `keluarga` (tenant) | 1 baris per akun terdaftar, terhubung ke `auth.users` Supabase. |
| `kontak` | Milik satu `keluarga`. Kolom: nama, `no_hp` (opsional), `alamat_lengkap` (opsional), catatan. |
| `jenis_acara` | Referensi jenis acara (Pernikahan, Khitanan, Syukuran, Duka Cita, dll.) dengan kolom `kategori_acara` (enum: `suka_cita` / `duka`). |
| `transaksi` | Baris amplop masuk/keluar. Kolom: `kontak_id` (wajib, relasi ke `kontak`), `jenis_acara_id`, `nominal`, `tipe` (masuk/keluar), `nama_acara` (teks bebas untuk histori, misal "Nikahan Anak Pertama"), `tanggal_acara`, `keterangan`, nomor urut (sequence). |

> Kalkulasi Jejak Silaturahmi = SUM(transaksi masuk) − SUM(transaksi keluar) per `kontak_id`, difilter berdasarkan `kategori_acara` pada `jenis_acara` terkait, dihitung kumulatif tanpa batas waktu/acara.

---

## 6. Spesifikasi Teknis

| Lapisan Sistem | Teknologi | Peran & Fungsi |
|---|---|---|
| Frontend UI | Vue.js 3 (Composition API) | Mengelola komponen reaktif, state, dan alur navigasi halaman pengguna. |
| Styling | Tailwind CSS | Membangun antarmuka yang bersih, modern, dan sepenuhnya responsif di perangkat mobile. |
| Backend & DB | Supabase (PostgreSQL) | Menyediakan layanan otentikasi, REST API otomatis, Database Views untuk kalkulasi cepat, dan RLS. |
| Penempatan | Vercel | Layanan hosting frontend berbasis CDN global yang cepat dan andal. |

---

## 7. Di Luar Cakupan (Out of Scope) untuk Versi Ini

Fitur berikut didiskusikan namun disepakati **tidak** masuk ke MVP, dan dapat dipertimbangkan pada fase pengembangan berikutnya:

- **Multi-user per keluarga** (invite anggota lain ke tenant yang sama) — ditiadakan; cukup satu akun per keluarga.
- **Reminder/notifikasi** otomatis untuk titipan yang belum dibalas — bersifat opsional, dapat ditambahkan kemudian.
- **Ekspor PDF** — dipertimbangkan setelah ekspor Excel/CSV tersedia.
- **Multi-acara sebagai entitas terpisah** dalam satu akun — tidak diperlukan; sistem cukup menggunakan model kumulatif per kontak dengan field riwayat acara di setiap transaksi (lihat bagian 4D dan 5).

---

## 8. Pertimbangan Non-Fungsional

- **Keamanan data:** RLS wajib diuji dengan skenario cross-tenant sebelum rilis; No. HP kontak tidak boleh terekspos ke client lebih dari yang dibutuhkan UI.
- **Konsistensi data:** Nomor urut transaksi dan pencatatan bersamaan harus aman dari race condition (gunakan sequence/serial PostgreSQL, bukan penghitungan di sisi frontend).
- **Skalabilitas:** Perlu dipantau batas kuota Supabase (baris data, storage, bandwidth) seiring pertumbuhan jumlah keluarga terdaftar; rencanakan titik upgrade paket sebelum limit tercapai.
- **Model monetisasi:** Belum didefinisikan pada versi ini (asumsi gratis untuk MVP); perlu diputuskan sebelum scaling lebih lanjut karena akan memengaruhi desain kuota/fitur berbayar.
