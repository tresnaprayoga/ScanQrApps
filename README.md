# ScanQrApps

Aplikasi Scan QR yang terdiri dari frontend dan backend.

## Struktur Folder

- `frontend/`: Source code untuk aplikasi frontend
- `backend/`: Source code untuk aplikasi backend

## Cara Menjalankan

### Frontend

1. Masuk ke folder frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Jalankan aplikasi: `npm run dev`

### Backend

1. Masuk ke folder backend: `cd backend`
2. Install dependencies: `npm install`
3. Konfigurasi Database:
   - Copy file `backend/.env.example` menjadi `backend/.env`
   - Sesuaikan kredensial MySQL Anda (`DB_USER`, `DB_PASSWORD`, dsb)
4. Setup Database & Seeding: Jalankan `npm run db:setup` di folder `backend/` untuk otomatis membuat database, tabel `cards`, dan men-generate 50 ID kartu awal (A001-A050).
5. Jalankan server: `npm run dev` atau `npm start`

Untuk pengujian skenario aktivasi, proses seeding juga membuat atau mereset kartu `TEST01` ke status belum aktif dengan kode verifikasi `TEST1234`.

Untuk endpoint QR/NFC `GET /r/:card_id`, jalankan frontend di `http://localhost:3000` dan backend di port `5000`. Frontend mem-proxy request `/r` dan `/api` ke backend, sedangkan `FRONTEND_URL=http://localhost:3000` mengarahkan kartu yang belum aktif ke halaman aktivasi.
