const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cards.controller');
const validatePin = require('../middleware/validatePin');
const {
	validateCardId,
	validatePinBody,
	validateActivation,
	validateUpdate
} = require('../middleware/validation');

// POST /api/cards/activate
router.post('/activate', validateActivation, cardsController.activateCard);
router.post('/:card_id/verify-pin', validateCardId, validatePinBody, validatePin, cardsController.verifyPin);
router.put('/:card_id', validateCardId, validatePinBody, validateUpdate, validatePin, cardsController.updateCard);

module.exports = router;
