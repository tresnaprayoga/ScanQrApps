const express = require('express');
const redirectController = require('../controllers/redirect.controller');

const router = express.Router();

router.get('/:card_id', redirectController.redirectCard);

module.exports = router;