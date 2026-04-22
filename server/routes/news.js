const express = require('express');
const router = express.Router();
const { getAgriNews } = require('../controllers/news');

router.get('/', getAgriNews);

module.exports = router;
