// require('dotenv').config();
// const mysql = require('mysql2/promise');
// const bcrypt = require('bcrypt');
// const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');

// async function setupDatabase() {
//   const connection = await mysql.createConnection({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || ''
//   });

//   try {
//     const dbName = process.env.DB_NAME || 'qrcodeapp';
//     console.log(`[1] Membuat database '${dbName}' jika belum ada...`);
//     await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
//     await connection.query(`USE \`${dbName}\``);

//     console.log('[2] Menjalankan migrasi tabel cards...');
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS cards (
//           id VARCHAR(20) PRIMARY KEY,
//           business_name VARCHAR(255) NULL,
//           business_address VARCHAR(255) NULL,
//           review_link TEXT NULL,
//           place_id VARCHAR(255) NULL,
//           pin_hash VARCHAR(255) NULL,
//           activation_code_hash VARCHAR(255) NULL,
//           status ENUM('belum_aktif', 'aktif') DEFAULT 'belum_aktif',
//           activated_at DATETIME NULL,
//           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       );
//     `;
//     await connection.query(createTableQuery);
//     console.log('    Tabel cards berhasil dicek/dibuat.');

//     console.log('[3] Generate batch ID kartu (A001 - A050, TEST01)...');
//     const cardIds = [
//       ...Array.from({ length: 50 }, (_, index) => `A${String(index + 1).padStart(3, '0')}`),
//       'TEST01'
//     ];
//     const [existingCards] = await connection.query(
//       'SELECT id, activation_code_hash FROM cards WHERE id IN (?)',
//       [cardIds]
//     );
//     const existingById = new Map(existingCards.map((card) => [card.id, card]));
//     const cards = [];
//     for (const id of cardIds) {
//       if (id === 'TEST01') continue;
//       if (existingById.get(id)?.activation_code_hash) continue;
//       const activationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
//       const activationCodeHash = await bcrypt.hash(activationCode, 10);
//       cards.push([id, activationCodeHash, activationCode]);
//     }

//     const insertQuery = `INSERT INTO cards (id, status, activation_code_hash) VALUES ?
//       ON DUPLICATE KEY UPDATE activation_code_hash = COALESCE(activation_code_hash, VALUES(activation_code_hash))`;
//     const [result] = cards.length
//       ? await connection.query(insertQuery, [cards.map(([id, hash]) => [id, 'belum_aktif', hash])])
//       : [{ affectedRows: 0 }];

//     const testActivationCode = 'TEST1234';
//     const testActivationCodeHash = await bcrypt.hash(testActivationCode, 10);
//     await connection.query(
//       `INSERT INTO cards (id, status, activation_code_hash)
//        VALUES (?, 'belum_aktif', ?)
//        ON DUPLICATE KEY UPDATE
//          status = 'belum_aktif',
//          business_name = NULL,
//          business_address = NULL,
//          review_link = NULL,
//          pin_hash = NULL,
//          activation_code_hash = VALUES(activation_code_hash),
//          activated_at = NULL`,
//       ['TEST01', testActivationCodeHash]
//     );
    
//     console.log(`    Berhasil insert ${result.affectedRows} kartu baru.`);
//     console.log('    Kode verifikasi kartu baru (cetak bersama kartu):');
//     cards.forEach(([id, , code]) => console.log(`      ${id}: ${code}`));
//     console.log(`      TEST01: ${testActivationCode}`);
//     console.log('✅ Proses setup dan seeding database selesai!');
    
//   } catch (error) {
//     console.error('❌ Error saat setup database:', error.message);
//   } finally {
//     await connection.end();
//   }
// }

// setupDatabase();


// =================================

// 






require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Perubahan dari versi sebelumnya:
 * - TIDAK lagi generate kode verifikasi unik per kartu.
 * - Verifikasi aktivasi sekarang pakai 1 "master code" yang sama untuk
 *   semua kartu, disimpan sebagai hash di .env (MASTER_ACTIVATION_CODE_HASH).
 * - Kolom activation_code_hash di tabel cards dibiarkan ada (tidak dihapus),
 *   tapi sudah tidak dipakai lagi -- boleh selalu NULL.
 */

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    const dbName = process.env.DB_NAME || 'qrcodeapp';
    console.log(`[1] Membuat database '${dbName}' jika belum ada...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log('[2] Menjalankan migrasi tabel cards...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS cards (
          id VARCHAR(20) PRIMARY KEY,
          business_name VARCHAR(255) NULL,
          business_address VARCHAR(255) NULL,
          review_link TEXT NULL,
          place_id VARCHAR(255) NULL,
          pin_hash VARCHAR(255) NULL,
          activation_code_hash VARCHAR(255) NULL,
          status ENUM('belum_aktif', 'aktif') DEFAULT 'belum_aktif',
          activated_at DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createTableQuery);
    console.log('    Tabel cards berhasil dicek/dibuat.');

    console.log('[3] Generate batch ID kartu (A001 - A050, TEST01)...');
    const cardIds = [
      ...Array.from({ length: 50 }, (_, index) => `A${String(index + 1).padStart(3, '0')}`),
      'TEST01'
    ];

    const [existingCards] = await connection.query(
      'SELECT id FROM cards WHERE id IN (?)',
      [cardIds]
    );
    const existingIds = new Set(existingCards.map((c) => c.id));
    const newIds = cardIds.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) {
      console.log('    Semua ID sudah ada di database, tidak ada yang baru ditambahkan.');
    } else {
      const rows = newIds.map((id) => [id, 'belum_aktif']);
      const insertQuery = `INSERT INTO cards (id, status) VALUES ?`;
      const [result] = await connection.query(insertQuery, [rows]);
      console.log(`    Berhasil insert ${result.affectedRows} kartu baru: ${newIds.join(', ')}`);
    }

    console.log('');
    console.log('✅ Proses setup dan seeding database selesai!');
    console.log('');
    console.log('ℹ️  Kode verifikasi sekarang pakai MASTER CODE (1 kode untuk semua kartu).');
    console.log('   Pastikan MASTER_ACTIVATION_CODE_HASH sudah diisi di file .env.');
    console.log('   Kalau belum ada, generate dulu:');
    console.log('     node');
    console.log('     const bcrypt = require("bcrypt");');
    console.log('     bcrypt.hash("KODE_MASTER_KAMU", 10).then(console.log);');

  } catch (error) {
    console.error('❌ Error saat setup database:', error.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();