const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cards.controller');
const validatePin = require('../middleware/validatePin');

// POST /api/cards/activate
router.post('/activate', cardsController.activateCard);
router.post('/:card_id/verify-pin', validatePin, cardsController.verifyPin);
router.put('/:card_id', validatePin, cardsController.updateCard);

module.exports = router;
