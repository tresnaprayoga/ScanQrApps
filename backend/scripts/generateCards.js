require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Generate batch ID kartu baru ke database, dengan prefix/jumlah/mulai-dari
 * yang bisa diatur lewat argumen command line. Tidak menimpa ID yang sudah ada.
 *
 * Cara pakai:
 *   node scripts/generateCards.js --prefix=A --count=50
 *   node scripts/generateCards.js --prefix=B --count=50 --start=1
 *   node scripts/generateCards.js --prefix=A --count=20 --start=51 --pad=3
 */

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  });
  return {
    prefix: args.prefix || 'A',
    count: parseInt(args.count || '50', 10),
    start: parseInt(args.start || '1', 10),
    pad: parseInt(args.pad || '3', 10),
  };
}

async function generateCards() {
  const { prefix, count, start, pad } = parseArgs();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'qrcodeapp',
  });

  try {
    const cardIds = Array.from(
      { length: count },
      (_, i) => `${prefix}${String(start + i).padStart(pad, '0')}`
    );

    console.log(`[1] Mengecek ${cardIds.length} ID kartu (${cardIds[0]} - ${cardIds[cardIds.length - 1]})...`);

    const [existingCards] = await connection.query(
      'SELECT id FROM cards WHERE id IN (?)',
      [cardIds]
    );
    const existingIds = new Set(existingCards.map((c) => c.id));
    const newIds = cardIds.filter((id) => !existingIds.has(id));
    const skippedCount = cardIds.length - newIds.length;

    if (skippedCount > 0) {
      console.log(`    ${skippedCount} ID sudah ada di database, dilewati.`);
    }

    if (newIds.length === 0) {
      console.log('    Tidak ada kartu baru untuk digenerate. Selesai.');
      return;
    }

    console.log(`[2] Menyimpan ${newIds.length} kartu baru ke database...`);
    const rows = newIds.map((id) => [id, 'belum_aktif']);
    const [result] = await connection.query(
      'INSERT INTO cards (id, status) VALUES ?',
      [rows]
    );

    console.log(`    Berhasil insert ${result.affectedRows} kartu baru: ${newIds.join(', ')}`);
    console.log('');
    console.log('✅ Selesai.');

  } catch (error) {
    console.error('❌ Error saat generate kartu:', error.message);
  } finally {
    await connection.end();
  }
}

generateCards();