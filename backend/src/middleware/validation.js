const { AppError } = require('./errorHandler');

const CARD_ID_PATTERN = /^[A-Za-z0-9_-]{1,50}$/;
const PIN_PATTERN = /^\d{4}$/;
const ACTIVATION_CODE_PATTERN = /^[A-Za-z0-9]{8}$/;
const REVIEW_DOMAINS = ['google.com', 'g.page', 'goo.gl'];

const fail = (message, details) => {
  throw new AppError(400, 'VALIDATION_ERROR', message, details);
};

const isReviewLink = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && REVIEW_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch (error) {
    return false;
  }
};

const validateCardId = (req, res, next) => {
  const cardId = req.params.card_id || req.body?.card_id;
  if (typeof cardId !== 'string' || !CARD_ID_PATTERN.test(cardId)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'card_id harus berupa ID kartu yang valid.'));
  }
  next();
};

const validatePinBody = (req, res, next) => {
  if (typeof req.body?.pin !== 'string' || !PIN_PATTERN.test(req.body.pin)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'PIN harus berupa 4 digit angka.'));
  }
  next();
};

const validateReviewLink = (req, res, next) => {
  if (!isReviewLink(req.body?.review_link)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'review_link harus berupa link Google Review HTTPS yang valid.'));
  }
  next();
};

const validateActivation = (req, res, next) => {
  const { card_id, activation_code, business_name, review_link, pin, business_address } = req.body || {};

  if (typeof card_id !== 'string' || !CARD_ID_PATTERN.test(card_id)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'card_id harus berupa ID kartu yang valid.'));
  }
  if (typeof activation_code !== 'string' || !ACTIVATION_CODE_PATTERN.test(activation_code)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Kode verifikasi kartu harus terdiri dari 8 karakter.'));
  }
  if (typeof business_name !== 'string' || !business_name.trim()) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'business_name tidak boleh kosong.'));
  }
  if (business_address !== undefined && business_address !== null && typeof business_address !== 'string') {
    return next(new AppError(400, 'VALIDATION_ERROR', 'business_address harus berupa teks.'));
  }
  if (!isReviewLink(review_link)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'review_link harus berupa link Google Review HTTPS yang valid.'));
  }
  if (typeof pin !== 'string' || !PIN_PATTERN.test(pin)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'PIN harus berupa 4 digit angka.'));
  }
  next();
};

const validateUpdate = (req, res, next) => {
  const { business_name, business_address, review_link } = req.body || {};
  if (business_name === undefined && business_address === undefined && review_link === undefined) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Minimal satu data bisnis harus diisi.'));
  }
  if (business_name !== undefined && (typeof business_name !== 'string' || !business_name.trim())) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'business_name tidak boleh kosong.'));
  }
  if (business_address !== undefined && typeof business_address !== 'string') {
    return next(new AppError(400, 'VALIDATION_ERROR', 'business_address harus berupa teks.'));
  }
  if (review_link !== undefined && !isReviewLink(review_link)) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'review_link harus berupa link Google Review HTTPS yang valid.'));
  }
  next();
};

module.exports = {
  validateCardId,
  validatePinBody,
  validateReviewLink,
  validateActivation,
  validateUpdate,
  isReviewLink
};