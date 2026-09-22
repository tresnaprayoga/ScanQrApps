const CardModel = require('../models/card.model');
const bcrypt = require('bcrypt');
const { AppError } = require('../middleware/errorHandler');

const activateCard = async (req, res, next) => {
  try {
    const { card_id, business_name, business_address, review_link, pin, activation_code } = req.body;

    // Check if card exists
    const card = await CardModel.findById(card_id);
    if (!card) {
      return next(new AppError(404, 'CARD_NOT_FOUND', `Kartu dengan ID ${card_id} tidak ditemukan.`));
    }

    // Check if already active
    if (card.status === 'aktif') {
      return next(new AppError(409, 'CARD_ALREADY_ACTIVE', 'Kartu ini sudah aktif. Gunakan fungsi edit (update) untuk mengubah data.'));
    }

    const validActivationCode = card.activation_code_hash
      && await bcrypt.compare(activation_code.toUpperCase(), card.activation_code_hash);
    if (!validActivationCode) {
      return next(new AppError(403, 'INVALID_ACTIVATION_CODE', 'Kode verifikasi kartu tidak valid.'));
    }

    // Hash PIN
    const pin_hash = await bcrypt.hash(pin, 10);

    // Activate Card via Model
    await CardModel.activate(card_id, {
      business_name,
      business_address,
      review_link,
      pin_hash
    });

    return res.status(200).json({
      message: 'Kartu berhasil diaktivasi.',
      data: {
        card_id,
        business_name,
        status: 'aktif'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  activateCard,
  verifyPin: (req, res) => res.status(200).json({
    message: 'PIN valid.',
    data: {
      card_id: req.params.card_id,
      business_name: req.card.business_name,
      business_address: req.card.business_address || '',
      review_link: req.card.review_link
    }
  }),
  updateCard: async (req, res, next) => {
    try {
      const { business_name, business_address, review_link } = req.body || {};

      await CardModel.update(req.params.card_id, {
        business_name,
        business_address,
        review_link
      });

      return res.status(200).json({
        message: 'Data kartu berhasil diperbarui.',
        data: {
          card_id: req.params.card_id,
          business_name: business_name === undefined ? req.card.business_name : business_name,
          business_address: business_address === undefined ? req.card.business_address : business_address,
          review_link: review_link === undefined ? req.card.review_link : review_link,
          status: req.card.status
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
