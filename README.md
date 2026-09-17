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
