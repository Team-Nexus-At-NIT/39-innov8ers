const express = require('express');
const { getDashboardIntelligence } = require('../controllers/weather');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDashboardIntelligence);

module.exports = router;
