const CardModel = require('../models/card.model');

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const redirectCard = async (req, res) => {
  const { card_id: cardId } = req.params;

  try {
    const card = await CardModel.findForRedirect(cardId);

    if (!card) {
      const invalidCardUrl = new URL('/not-active', FRONTEND_URL);
      invalidCardUrl.searchParams.set('reason', 'invalid');
      invalidCardUrl.searchParams.set('card_id', cardId);
      return res.redirect(302, invalidCardUrl.toString());
    }

    if (card.status !== 'aktif') {
      const activationUrl = new URL(`/activation/${encodeURIComponent(card.id)}`, FRONTEND_URL);
      return res.redirect(302, activationUrl.toString());
    }

    if (!card.review_link) {
      const invalidCardUrl = new URL('/not-active', FRONTEND_URL);
      invalidCardUrl.searchParams.set('reason', 'invalid');
      invalidCardUrl.searchParams.set('card_id', card.id);
      return res.redirect(302, invalidCardUrl.toString());
    }

    return res.redirect(302, card.review_link);
  } catch (error) {
    console.error('Error redirecting card:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

module.exports = {
  redirectCard
};