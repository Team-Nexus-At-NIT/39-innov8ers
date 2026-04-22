const { getRecommendation, detectDisease } = require('../utils/ai');
const { getWeather } = require('../utils/weather');
const asyncHandler = require('../middleware/async');

// @desc    Get Crop Recommendation
// @route   POST /api/features/recommend
// @access  Private
exports.getRecommendations = asyncHandler(async (req, res, next) => {
    const { soilType, location } = req.body;
    const data = getRecommendation(soilType, location);
    res.status(200).json({ success: true, data });
});

// @desc    Detect Disease
// @route   POST /api/features/detect-disease
// @access  Private
exports.analyzeCropImage = asyncHandler(async (req, res, next) => {
    const { imageUrl } = req.body;
    const data = detectDisease(imageUrl);
    res.status(200).json({ success: true, data });
});

// @desc    Get Weather
// @route   GET /api/features/weather
// @access  Private
exports.getLocalWeather = asyncHandler(async (req, res, next) => {
    const { lat, lng } = req.query;
    const data = getWeather(lat, lng);
    res.status(200).json({ success: true, data });
});
