const asyncHandler = require('../middleware/async');

// Mock Data Generators
const states = ['Maharashtra', 'Punjab', 'Gujarat', 'Uttar Pradesh', 'Madhya Pradesh'];
const crops = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Onion', 'Tomato', 'Potato', 'Maize'];
const markets = ['Pune APMC', 'Nagpur', 'Nasik', 'Indore', 'Lucknow', 'Ahmedabad', 'Ludhiana'];

const getRandomPrice = (base) => {
    const variation = base * 0.1; // 10% variation
    return Math.floor(base - variation + Math.random() * (variation * 2));
};

const generateMarketData = () => {
    let data = [];
    const basePrices = {
        'Wheat': 2200, 'Rice': 2800, 'Cotton': 6000,
        'Soybean': 4500, 'Onion': 1500, 'Tomato': 1200,
        'Potato': 1000, 'Maize': 1800
    };

    states.forEach(state => {
        markets.forEach(market => {
            crops.forEach(crop => {
                if (Math.random() > 0.7) return; // Randomly skip some combos
                const price = getRandomPrice(basePrices[crop]);
                data.push({
                    id: `${state}-${market}-${crop}`,
                    state,
                    market,
                    commodity: crop,
                    min_price: price - 100,
                    max_price: price + 200,
                    modal_price: price,
                    trend: Math.random() > 0.5 ? 'up' : 'down',
                    change: (Math.random() * 5).toFixed(2),
                    last_updated: new Date()
                });
            });
        });
    });
    return data;
};

// @desc    Get Live Mandi Prices
// @route   GET /api/market/prices
// @access  Public
exports.getMarketPrices = asyncHandler(async (req, res, next) => {
    const { state, commodity } = req.query;

    // In a real app, this would fetch from an external API or DB
    // Here we generate fresh mock data on request or cache it
    let allData = generateMarketData();

    if (state && state !== 'All') {
        allData = allData.filter(item => item.state === state);
    }

    if (commodity && commodity !== 'All') {
        allData = allData.filter(item => item.commodity === commodity);
    }

    res.status(200).json({
        success: true,
        count: allData.length,
        timestamp: new Date(),
        data: allData
    });
});
