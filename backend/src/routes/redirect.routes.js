const express = require('express');
const redirectController = require('../controllers/redirect.controller');
const { validateCardId } = require('../middleware/validation');

const router = express.Router();

router.get('/:card_id', validateCardId, redirectController.redirectCard);

module.exports = router;