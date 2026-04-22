exports.getWeather = (lat, lng) => {
    // Mock weather data
    return {
        temp: 28 + Math.random() * 5, // Celsius
        humidity: 60 + Math.random() * 20, // %
        condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
        rainfall: Math.random() * 10, // mm
        forecast: [
            { day: 'Tomorrow', condition: 'Sunny', temp: 30 },
            { day: 'Day After', condition: 'Cloudy', temp: 29 }
        ]
    };
};
