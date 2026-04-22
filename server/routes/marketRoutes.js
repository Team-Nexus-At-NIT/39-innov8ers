const express = require('express');
const { getLivePrices } = require('../controllers/marketController');
const router = express.Router();

router.route('/').get(getLivePrices);

module.exports = router;
