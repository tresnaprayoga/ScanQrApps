Product Requirements Document (PRD)
QrcodeApp — Sistem Kartu NFC+QR Review UMKM

Versi: 1.1 Tanggal: 17 September 2026 Status: Draft

Catatan revisi: v1.0 tidak lagi menggunakan Google Places API. Pencarian bisnis diganti input manual (nama bisnis + link Google Review diisi langsung). Integrasi Google Places API dipindah menjadi enhancement di v1.2.

1. Ringkasan Produk

QrcodeApp adalah sistem yang memungkinkan penjual kartu/stand NFC+QR untuk mengaktivasi kartu secara digital, menghubungkan setiap kartu fisik ke halaman ulasan Google Bisnis milik UMKM. Pelanggan cukup tap NFC atau scan QR pada kartu untuk langsung diarahkan ke form ulasan Google bisnis tersebut.

2. Latar Belakang & Masalah
UMKM sulit mengarahkan pelanggan untuk memberi ulasan Google karena harus mencari sendiri nama tokonya di Google
Kartu QR statis (link langsung tercetak) tidak fleksibel — jika link berubah, kartu harus dicetak ulang
Dibutuhkan sistem aktivasi yang cepat, bisa dilakukan penjual langsung dari HP saat transaksi dengan UMKM
3. Tujuan Produk
Penjual dapat mengaktivasi kartu dalam < 1 menit melalui dashboard mobile
Kartu dicetak massal terlebih dahulu (ID generik), diaktivasi belakangan sesuai UMKM pembeli
Setiap kartu diproteksi PIN agar hanya pemilik/penjual yang bisa mengubah data setelah aktif
Sistem mencatat data aktivasi untuk keperluan tracking/analytics ke depan
4. Target Pengguna
Peran	Deskripsi
Penjual/Admin	Menjual kartu ke UMKM, melakukan aktivasi via dashboard
UMKM	Pemilik kartu, memegang PIN untuk edit data kartu miliknya
Pelanggan UMKM	Tap NFC / scan QR pada kartu, diarahkan ke halaman review Google
5. Tech Stack

Frontend

React JS + Vite
Struktur komponen modular (folder per komponen)
Styling dengan CSS Modules

Backend

Express JS (REST API)
MySQL (database)

Struktur folder proyek

QrcodeApp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBusiness/
│   │   │   │   ├── SearchBusiness.jsx
│   │   │   │   └── SearchBusiness.module.css
│   │   │   ├── PinInput/
│   │   │   │   ├── PinInput.jsx
│   │   │   │   └── PinInput.module.css
│   │   │   ├── ActivateButton/
│   │   │   │   ├── ActivateButton.jsx
│   │   │   │   └── ActivateButton.module.css
│   │   │   └── CardStatus/
│   │   │       ├── CardStatus.jsx
│   │   │       └── CardStatus.module.css
│   │   ├── pages/
│   │   │   ├── ActivationPage/
│   │   │   ├── EditCardPage/
│   │   │   └── NotActivePage/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── cards.routes.js
│   │   │   └── redirect.routes.js
│   │   ├── controllers/
│   │   │   ├── cards.controller.js
│   │   │   └── redirect.controller.js
│   │   ├── models/
│   │   │   └── card.model.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   └── validatePin.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── README.md
6. Fitur Utama (Scope v1)
6.1 Input Data Bisnis (Manual)
Admin mengisi nama bisnis UMKM secara manual (input teks bebas)
Admin mengisi link Google Review UMKM secara manual (paste dari link yang dikirim UMKM, atau dicari sendiri lewat Google Maps lalu dikonfirmasi ke UMKM)
Tidak ada pencarian/autocomplete otomatis di v1.0 — proses ini sepenuhnya manual, tanpa ketergantungan ke API eksternal
6.2 Aktivasi Kartu
Admin memilih bisnis dari hasil pencarian
Admin membuat PIN 4 digit untuk kartu tersebut
Sistem menyimpan mapping: ID kartu → link review Google, nama bisnis, PIN (di-hash)
Status kartu berubah dari "belum aktif" menjadi "aktif"
6.3 Redirect Otomatis (QR/NFC)
Saat kartu di-scan/tap, sistem membaca ID kartu dari URL
Jika kartu berstatus aktif → redirect ke link review Google Bisnis UMKM
Jika belum aktif → tampilkan halaman informasi "kartu belum aktif"
6.4 Edit Data Kartu
UMKM/admin dapat mengubah data kartu (nama bisnis, link review) setelah verifikasi PIN
Perubahan langsung berlaku tanpa cetak ulang kartu fisik
6.5 Riwayat Aktivasi (opsional v1, wajib v1.1)
Mencatat setiap kartu yang sudah diaktivasi: nama bisnis, tanggal aktivasi
Dasar untuk fitur analytics jumlah scan di versi berikutnya
7. Alur Pengguna (User Flow)

Alur aktivasi:

Admin buka form aktivasi (scan QR kartu yang belum aktif)
   → isi nama bisnis UMKM (manual)
   → isi link Google Review UMKM (manual, dari UMKM atau hasil cari sendiri)
   → buat PIN 4 digit
   → tekan "Aktifkan kartu"
   → sistem simpan data & set status aktif

Cara UMKM mendapatkan link Google Review (di luar sistem, dilakukan sebelum isi form):

UMKM buka Google Business Profile
   → menu "Dapatkan lebih banyak ulasan" / "Bagikan formulir ulasan"
   → copy link → kirim ke admin

Alternatif kalau UMKM kesulitan: admin cari sendiri via Google Maps (cari nama toko → tombol "Tulis ulasan" → copy link), lalu konfirmasi ke UMKM sebelum disimpan.

Alur pelanggan:

Pelanggan tap NFC / scan QR di kartu
   → dialihkan ke endpoint redirect
   → sistem cek status kartu
   → jika aktif: langsung ke form review Google Bisnis
   → jika belum aktif: tampil halaman informasi
8. API Endpoints
Method	Endpoint	Fungsi
POST	/api/cards/activate	Aktivasi kartu (simpan nama bisnis, link review manual, & PIN)
PUT	/api/cards/:card_id	Update data kartu (butuh verifikasi PIN)
GET	/r/:card_id	Endpoint redirect utama (dipanggil dari QR/NFC) — cabang ke halaman aktivasi, redirect review, atau halaman tidak valid
GET	/api/cards/:card_id	Ambil detail status kartu

Enhancement v1.2 (opsional, tidak ada di v1.0):

Method	Endpoint	Fungsi
GET	/api/places/search?q=	Cari nama bisnis via Google Places (proxy dari backend)
GET	/api/places/details/:place_id	Ambil detail bisnis + link review otomatis
9. Skema Database (MySQL)

Tabel cards

Kolom	Tipe	Keterangan
id	VARCHAR(20)	Primary key, ID unik kartu (contoh: A014)
business_name	VARCHAR(255)	Nama bisnis UMKM (diisi manual)
business_address	VARCHAR(255) NULL	Alamat UMKM (opsional, diisi manual jika ada)
review_link	TEXT	Link ulasan Google Bisnis (diisi manual)
place_id	VARCHAR(255) NULL	Disiapkan untuk enhancement v1.2 (Google Places), kosong di v1.0
pin_hash	VARCHAR(255)	PIN yang sudah di-hash (bcrypt)
status	ENUM('belum_aktif','aktif')	Status kartu
activated_at	DATETIME	Waktu aktivasi
created_at	DATETIME	Waktu kartu dibuat/dicetak

Tabel scan_logs (opsional, untuk analytics)

Kolom	Tipe	Keterangan
id	INT (auto increment)	Primary key
card_id	VARCHAR(20)	Foreign key ke cards.id
scanned_at	DATETIME	Waktu discan
source	ENUM('qr','nfc')	Sumber scan (opsional, jika bisa dibedakan)
10. Kebutuhan Non-Fungsional
Keamanan: PIN wajib di-hash (bcrypt) sebelum disimpan, tidak pernah dikembalikan ke frontend dalam bentuk apapun
Performa: Endpoint redirect (/r/:card_id) harus merespons cepat (< 500ms) karena berpengaruh langsung ke pengalaman pelanggan
Kompatibilitas: Halaman redirect harus berjalan baik di browser default Android maupun Safari iOS
Skalabilitas: Struktur database mendukung penambahan ribuan kartu tanpa perubahan skema
11. Batasan (Out of Scope v1)
Tidak ada sistem pembayaran/e-commerce di dalam aplikasi ini
Tidak ada dashboard analytics visual (grafik) di v1 — cukup pencatatan data mentah
Tidak ada multi-level user/role (admin vs UMKM login terpisah) — verifikasi cukup lewat PIN per kartu
Tidak ada integrasi Google Places API di v1.0 — pencarian nama bisnis otomatis dipindah ke v1.2
12. Rencana Pengembangan Bertahap
Fase	Cakupan
v1.0	Aktivasi kartu (input manual), redirect, edit dengan PIN
v1.1	Pencatatan riwayat scan (scan_logs)
v1.2	Integrasi Google Places API (autocomplete nama bisnis + ambil link review otomatis)
v1.3	Dashboard analytics sederhana (jumlah scan per kartu)
v2.0	Multi-admin, role-based access, laporan performa per UMKM