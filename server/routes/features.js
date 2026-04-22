const express = require('express');
const {
    getRecommendations,
    analyzeCropImage,
    getLocalWeather
} = require('../controllers/features');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/recommend', getRecommendations);
router.post('/detect-disease', analyzeCropImage);
router.get('/weather', getLocalWeather);

module.exports = router;
