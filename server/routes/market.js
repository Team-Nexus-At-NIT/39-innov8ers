const express = require('express');
const { getMarketPrices } = require('../controllers/market');
const router = express.Router();

router.get('/prices', getMarketPrices);

module.exports = router;
