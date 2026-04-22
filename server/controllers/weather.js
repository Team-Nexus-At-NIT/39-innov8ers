const asyncHandler = require('../middleware/async');
const axios = require('axios');
const User = require('../models/User');

// Helper to map WMO codes to our simplified conditions
const mapWmoCodeToCondition = (code) => {
    // 0: Clear sky
    if (code === 0) return 'Sunny';
    // 1-3: Mainly clear, partly cloudy, and overcast
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    // 45, 48: Fog
    if (code === 45 || code === 48) return 'Cloudy'; // Fog counts as cloudy for simplicity
    // 51-67: Drizzle & Rain
    if (code >= 51 && code <= 67) return 'Rainy';
    // 71-77: Snow
    if (code >= 71 && code <= 77) return 'Rainy'; // Treat snow as precipitation
    // 80-82: Rain showers
    if (code >= 80 && code <= 82) return 'Rainy';
    // 95-99: Thunderstorm
    if (code >= 95 && code <= 99) return 'Stormy';

    return 'Cloudy'; // Default
};

// @desc    Get Risk & Weather Intelligence
// @route   GET /api/weather
// @access  Private
exports.getDashboardIntelligence = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const coordinates = user.location?.coordinates || [77.5946, 12.9716]; // Default to Bangalore if missing
    const [lon, lat] = coordinates;

    let weatherData = null;
    let satelliteData = {};
    let isRealData = false;

    // 1. Fetch Real Weather from Open-Meteo (Free, No Key)
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto`;

        const { data } = await axios.get(url);

        const current = data.current_weather;
        const daily = data.daily;

        // Process Forecast (Next 7 days)
        const dailyForecast = [];
        for (let i = 0; i < 7; i++) {
            if (daily.time[i]) {
                const date = new Date(daily.time[i]);
                dailyForecast.push({
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2), // Avg temp
                    condition: mapWmoCodeToCondition(daily.weathercode[i])
                });
            }
        }

        // Approx humidity logic since Open-Meteo current_weather doesn't have it direct in simple endpoint
        // (For precision we could add &hourly=relativehumidity_2m but taking a simple approach for speed)
        // Let's add hourly for better accuracy.
        const hourlyUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=relativehumidity_2m,windspeed_10m&current_weather=true`;
        const hourlyRes = await axios.get(hourlyUrl);
        const currentHourIndex = new Date().getHours();
        const currentHumidity = hourlyRes.data.hourly.relativehumidity_2m[currentHourIndex] || 60;
        const currentWind = hourlyRes.data.hourly.windspeed_10m[currentHourIndex] || current.windspeed;

        weatherData = {
            current: {
                temp: current.temperature,
                humidity: currentHumidity,
                windSpeed: currentWind,
                precipitation: daily.precipitation_sum[0] || 0, // Today's total rain so far check
                condition: mapWmoCodeToCondition(current.weathercode)
            },
            forecast: dailyForecast
        };
        isRealData = true;

    } catch (error) {
        console.error("Open-Meteo API Error:", error.message);
        // Fallback to simulation will happen below
    }

    // Fallback Simulation if API failed
    if (!weatherData) {
        const today = new Date();
        const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Partly Cloudy'];
        const currentCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

        weatherData = {
            current: {
                temp: (25 + Math.random() * 10).toFixed(1),
                humidity: Math.floor(40 + Math.random() * 40),
                windSpeed: Math.floor(5 + Math.random() * 20),
                precipitation: Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0,
                condition: currentCondition
            },
            forecast: Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() + i + 1);
                return {
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temp: (24 + Math.random() * 8).toFixed(0),
                    condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
                };
            })
        };
    }

    // 2. Satellite Data & Derived Metrics (Smart Estimation based on Real Weather)
    // Since we don't have physical sensors, we estimate soil moisture from real rain/humidity data
    // This makes the "simulated" part act realistically in response to weather.

    let estimatedSoilMoisture = 45; // Base value
    if (weatherData.current.precipitation > 0) {
        estimatedSoilMoisture += (weatherData.current.precipitation * 5); // heavily increase if raining
    } else {
        estimatedSoilMoisture -= ((weatherData.current.temp - 25) * 0.5); // decrease if hot
    }
    // Clamp 10-90
    estimatedSoilMoisture = Math.min(Math.max(Math.round(estimatedSoilMoisture), 10), 95);

    satelliteData = {
        ndvi: (0.55 + (Math.random() * 0.1)).toFixed(2), // Slight variance, stable crop
        soilMoisture: estimatedSoilMoisture,
        vegetationHealth: estimatedSoilMoisture > 40 ? 'Good' : 'Water Stress'
    };

    // 3. Risk Analysis Engine (Real-Time Rules)
    let riskScore = 0; // 0-100
    let riskLevel = 'Low';
    let alerts = [];

    if (isRealData) alerts.push({ type: 'success', title: 'Live Weather Active', message: `Real-time conditions from ${coordinates[1].toFixed(2)}°N, ${coordinates[0].toFixed(2)}°E` });

    // Rule 1: High Temperature Risk
    if (weatherData.current.temp > 35) {
        riskScore += 20;
        alerts.push({ type: 'warning', title: 'Heat Stress Warning', message: `Temp (${weatherData.current.temp}°C) is high. Ensure irrigation.` });
    }
    if (weatherData.current.temp > 40) {
        riskScore += 20; // Critical add
        alerts.push({ type: 'critical', title: 'Extreme Heatwave', message: 'Crops at risk of scorching. Deploy shade nets if possible.' });
    }

    // Rule 2: Rainfall & Storm Risk
    if (weatherData.current.precipitation > 5) {
        riskScore += 15;
        alerts.push({ type: 'info', title: 'Rainfall Detected', message: `Receiving ${weatherData.current.precipitation}mm rain. Audit drainage.` });
    }
    if (weatherData.current.precipitation > 50 || weatherData.current.condition.includes('Storm')) {
        riskScore += 40;
        alerts.push({ type: 'critical', title: 'Storm Alert', message: 'Heavy storm predicted. Secure livestock and machinery.' });
    }

    // Rule 3: Wind Damage Risk
    if (weatherData.current.windSpeed > 25) {
        riskScore += 30;
        alerts.push({ type: 'warning', title: 'High Winds', message: `Wind speed ${weatherData.current.windSpeed} km/h may damage tall crops.` });
    }

    // Rule 4: Soil Moisture Risk (Derived from Real Data)
    if (satelliteData.soilMoisture < 30) {
        riskScore += 15;
        alerts.push({ type: 'warning', title: 'Low Soil Moisture', message: 'Ground is dry. Irrigation recommended.' });
    } else if (satelliteData.soilMoisture > 85) {
        riskScore += 15;
        alerts.push({ type: 'info', title: 'Waterlogging Risk', message: 'Soil saturation high. Watch for fungal issues.' });
    }

    // Determine Final Risk Level
    if (riskScore > 60) riskLevel = 'High';
    else if (riskScore > 30) riskLevel = 'Moderate';

    if (alerts.length === 0) {
        alerts.push({ type: 'success', title: 'Optimal Conditions', message: 'Crop health and weather conditions are looking good.' });
    }

    res.status(200).json({
        success: true,
        data: {
            weather: weatherData,
            satellite: satelliteData,
            risk: {
                score: riskScore,
                level: riskLevel
            },
            alerts: alerts,
            source: isRealData ? 'Live API' : 'Simulation'
        }
    });
});
