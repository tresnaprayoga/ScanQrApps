require('dotenv').config();
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const cardId = process.argv[2];
const cardIdPattern = /^[A-Za-z0-9_-]{1,50}$/;
const publicAppUrl = (process.env.PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const outputDirectory = path.resolve(__dirname, '../generated/qr');

if (!cardId || !cardIdPattern.test(cardId)) {
  console.error('Gunakan: npm run qr -- <card_id>');
  console.error('Contoh: npm run qr -- TEST01');
  process.exit(1);
}

const redirectUrl = `${publicAppUrl}/r/${encodeURIComponent(cardId)}`;
const outputPath = path.join(outputDirectory, `${cardId}.png`);

fs.mkdirSync(outputDirectory, { recursive: true });

QRCode.toFile(outputPath, redirectUrl, {
  type: 'png',
  width: 1200,
  margin: 4,
  errorCorrectionLevel: 'H'
})
  .then(() => {
    console.log(`QR berhasil dibuat: ${outputPath}`);
    console.log(`Isi QR: ${redirectUrl}`);
  })
  .catch((error) => {
    console.error('Gagal membuat QR:', error.message);
    process.exitCode = 1;
  });