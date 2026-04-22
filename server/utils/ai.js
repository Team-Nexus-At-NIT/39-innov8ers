exports.getRecommendation = (soil, location) => {
    // Mock logic based on soil type
    const recommendations = {
        'Black': ['Cotton', 'Soybean', 'Wheat'],
        'Red': ['Groundnut', 'Millets', 'Pulses'],
        'Alluvial': ['Rice', 'Wheat', 'Sugarcane'],
        'Laterite': ['Tea', 'Coffee', 'Rubber']
    };

    const recommended = recommendations[soil] || ['Maize', 'Sorghum'];

    return {
        soilType: soil,
        location: location,
        recommendedCrops: recommended,
        confidence: 0.85 + Math.random() * 0.1
    };
};

exports.detectDisease = (imageUrl) => {
    // Mock disease detection
    const diseases = ['Healthy', 'Leaf Blight', 'Rust', 'Mildew'];
    const result = diseases[Math.floor(Math.random() * diseases.length)];

    return {
        diagnosis: result,
        confidence: 0.92,
        remedy: result === 'Healthy' ? 'Maintain current care.' : 'Apply appropriate fungicide.'
    };
};
