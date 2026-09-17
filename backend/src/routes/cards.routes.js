const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cards.controller');

// POST /api/cards/activate
router.post('/activate', cardsController.activateCard);

module.exports = router;
