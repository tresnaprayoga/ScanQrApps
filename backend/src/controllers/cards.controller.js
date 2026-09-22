const CardModel = require('../models/card.model');
const bcrypt = require('bcrypt');

const validateReviewLink = (reviewLink) => {
  try {
    const url = new URL(reviewLink);
    const validDomains = ['google.com', 'g.page', 'goo.gl'];
    return validDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch (error) {
    return false;
  }
};

const activateCard = async (req, res) => {
  try {
    const { card_id, business_name, business_address, review_link, pin } = req.body;

    // Basic Validation
    if (!card_id) return res.status(400).json({ message: 'card_id tidak boleh kosong.' });
    if (!business_name) return res.status(400).json({ message: 'business_name tidak boleh kosong.' });
    if (!review_link) return res.status(400).json({ message: 'review_link tidak boleh kosong.' });
    
    // PIN Validation (4 digits exactly)
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN harus berupa 4 digit angka.' });
    }

    // URL Validation
    try {
      const url = new URL(review_link);
      // Validasi untuk memastikan URL adalah dari domain Google (google.com, g.page, goo.gl)
      const validDomains = ['google.com', 'g.page', 'goo.gl'];
      const isValidDomain = validDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
      
      if (!isValidDomain) {
        return res.status(400).json({ message: 'review_link harus berupa link Google Review yang valid (misal: google.com, g.page).' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Format review_link tidak valid (harus berupa URL yang benar).' });
    }

    // Check if card exists
    const card = await CardModel.findById(card_id);
    if (!card) {
      return res.status(404).json({ message: `Kartu dengan ID ${card_id} tidak ditemukan.` });
    }

    // Check if already active
    if (card.status === 'aktif') {
      return res.status(400).json({ message: 'Kartu ini sudah aktif. Gunakan fungsi edit (update) untuk mengubah data.' });
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
    console.error('Error activating card:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
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
  updateCard: async (req, res) => {
    try {
      const { business_name, business_address, review_link } = req.body || {};

      if (business_name === undefined && business_address === undefined && review_link === undefined) {
        return res.status(400).json({ message: 'Minimal satu data bisnis harus diisi.' });
      }
      if (business_name !== undefined && (typeof business_name !== 'string' || !business_name.trim())) {
        return res.status(400).json({ message: 'business_name tidak boleh kosong.' });
      }
      if (business_address !== undefined && typeof business_address !== 'string') {
        return res.status(400).json({ message: 'business_address harus berupa teks.' });
      }
      if (review_link !== undefined && !validateReviewLink(review_link)) {
        return res.status(400).json({ message: 'review_link harus berupa link Google Review yang valid.' });
      }

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
      console.error('Error updating card:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
  }
};
