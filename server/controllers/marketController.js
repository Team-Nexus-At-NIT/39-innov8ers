const axios = require('axios');

// In-memory cache
let marketDataCache = {
    data: [],
    lastUpdated: 0
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 Minutes

const getLivePrices = async (req, res) => {
    try {
        // Check cache
        if (Date.now() - marketDataCache.lastUpdated < CACHE_DURATION && marketDataCache.data.length > 0) {
            console.log('Serving from cache (Official API Data)');
            return res.status(200).json({
                success: true,
                count: marketDataCache.data.length,
                source: 'cache_official',
                data: marketDataCache.data
            });
        }

        console.log('Fetching fresh data from Official Agmarknet API...');

        // Official API Details provided by User
        const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
        const apiKey = '579b464db66ec23bdd000001635065555d1a40e26e0ccb5aa421b244';

        // Fetching 1000 records to cover "all crops" reasonable range
        const limit = 1000;
        const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=${limit}`;

        const { data } = await axios.get(url);

        if (data.status !== 'ok' || !data.records) {
            throw new Error('API Response not OK');
        }

        const apiRecords = data.records;
        const formattedData = apiRecords.map((record, index) => {
            // Mapping fields from Official API to our Frontend Model
            return {
                id: 10000 + index, // Unique ID
                crop: record.commodity,
                variety: record.variety,
                market: `${record.market}, ${record.state}`, // Combining for better display
                price: parseFloat(record.modal_price), // Modal price is standard trading price
                unit: 'Qtl', // Agmarknet prices are typically per Quintal
                change: "0%", // Not provided by API
                trend: "stable",
                lastUpdated: record.arrival_date
            };
        });

        marketDataCache = {
            data: formattedData,
            lastUpdated: Date.now()
        };

        res.status(200).json({
            success: true,
            count: formattedData.length,
            source: 'official_api',
            data: formattedData
        });

    } catch (error) {
        console.error('Official API Error:', error.message);

        // 1. Try Cached Data
        if (marketDataCache.data.length > 0) {
            console.log('Serving stale cache due to API error');
            return res.status(200).json({
                success: true,
                count: marketDataCache.data.length,
                source: 'stale_cache',
                data: marketDataCache.data
            });
        }

        // 2. Strict Mode: No Simulation
        // User requested "only show the original data".
        return res.status(503).json({
            success: false,
            message: 'Official Government API is currently unreachable and no cache is available. Please try again later.',
            source: 'error',
            data: []
        });
    }
};

module.exports = {
    getLivePrices
};
