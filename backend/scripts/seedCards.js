require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
          status ENUM('belum_aktif', 'aktif') DEFAULT 'belum_aktif',
          activated_at DATETIME NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await connection.query(createTableQuery);
    console.log('    Tabel cards berhasil dicek/dibuat.');

    console.log('[3] Generate batch ID kartu (A001 - A050)...');
    const cards = [];
    for (let i = 1; i <= 50; i++) {
      const id = `A${String(i).padStart(3, '0')}`;
      cards.push([id, 'belum_aktif']);
    }

    const insertQuery = `INSERT IGNORE INTO cards (id, status) VALUES ?`;
    const [result] = await connection.query(insertQuery, [cards]);
    
    console.log(`    Berhasil insert ${result.affectedRows} kartu baru.`);
    console.log('✅ Proses setup dan seeding database selesai!');
    
  } catch (error) {
    console.error('❌ Error saat setup database:', error.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();
