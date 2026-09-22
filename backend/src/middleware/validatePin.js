const CardModel = require('../models/card.model');
const { AppError } = require('./errorHandler');

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map();

const getAttemptKey = (req) => `${req.ip}:${req.params.card_id}`;

const validatePin = async (req, res, next) => {
  try {
    const { card_id } = req.params;
    const { pin } = req.body || {};
    const key = getAttemptKey(req);
    const now = Date.now();
    const record = attempts.get(key);

    if (record && now - record.startedAt >= WINDOW_MS) {
      attempts.delete(key);
    }

    const currentRecord = attempts.get(key);
    if (currentRecord && currentRecord.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - currentRecord.startedAt)) / 1000);
      return next(new AppError(429, 'PIN_RATE_LIMITED', 'Terlalu banyak percobaan PIN. Silakan coba lagi nanti.', {
        retry_after_seconds: retryAfter
      }));
    }

    const card = await CardModel.findById(card_id);
    if (!card) {
      return next(new AppError(404, 'CARD_NOT_FOUND', `Kartu dengan ID ${card_id} tidak ditemukan.`));
    }
    if (card.status !== 'aktif') {
      return next(new AppError(403, 'CARD_NOT_ACTIVE', 'Kartu belum aktif dan belum dapat diedit.'));
    }

    const isValid = await CardModel.verifyPin(card_id, pin);
    if (!isValid) {
      const failedRecord = currentRecord || { count: 0, startedAt: now };
      failedRecord.count += 1;
      attempts.set(key, failedRecord);

      if (failedRecord.count >= MAX_ATTEMPTS) {
        return next(new AppError(429, 'PIN_RATE_LIMITED', 'Terlalu banyak percobaan PIN. Silakan coba lagi nanti.', {
          retry_after_seconds: Math.ceil((WINDOW_MS - (now - failedRecord.startedAt)) / 1000)
        }));
      }

      return next(new AppError(401, 'INVALID_PIN', 'PIN salah.'));
    }

    attempts.delete(key);
    req.card = card;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validatePin;