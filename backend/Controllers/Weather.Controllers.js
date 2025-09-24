const axios = require('axios');

// Cache for weather data (simple in-memory cache)
const weatherCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper function for consistent API requests and error handling
const fetchWeatherData = async (url, res) => {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        return response.data;
    } catch (error) {
        console.error("Weather API error:", error.response?.data || error.message);
        if (error.response?.status === 400) {
            res.status(404).json({ message: 'Location not found.' });
        } else if (error.code === 'ECONNABORTED') {
            res.status(408).json({ message: 'Weather service request timed out.' });
        } else {
            res.status(500).json({ message: 'Failed to fetch weather data.' });
        }
        return null;
    }
};

exports.getWeatherByLocation = async (req, res) => {
    const { location } = req.query;

    if (!location || location.trim() === '') {
        return res.status(400).json({ message: 'Location query parameter is required.' });
    }

    const cacheKey = location.toLowerCase().trim();
    const cachedData = weatherCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        return res.status(200).json(cachedData.data);
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Weather API key is not configured on the server.' });
    }

    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`;

    const responseData = await fetchWeatherData(apiUrl, res);
    if (!responseData) {
        return;
    }

    const weatherData = {
        location: responseData.location.name,
        region: responseData.location.region,
        country: responseData.location.country,
        temp_c: responseData.current.temp_c,
        temp_f: responseData.current.temp_f,
        condition: responseData.current.condition.text,
        icon: responseData.current.condition.icon,
        humidity: responseData.current.humidity,
        wind_kph: responseData.current.wind_kph,
        feels_like_c: responseData.current.feelslike_c,
        last_updated: responseData.current.last_updated,
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    res.status(200).json(weatherData);
};

exports.getWeatherForecast = async (req, res) => {
    const { location, days } = req.query;
    const forecastDays = parseInt(days) || 3;

    if (!location || location.trim() === '') {
        return res.status(400).json({ message: 'Location is required.' });
    }

    if (forecastDays > 7) {
        return res.status(400).json({ message: 'Forecast is limited to a maximum of 7 days.' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Weather API key is not configured on the server.' });
    }

    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${forecastDays}&aqi=no&alerts=no`;

    const responseData = await fetchWeatherData(apiUrl, res);
    if (!responseData) {
        return;
    }

    const forecastData = {
        location: responseData.location.name,
        current: responseData.current,
        forecast: responseData.forecast.forecastday.map(day => ({
            date: day.date,
            day: {
                maxtemp_c: day.day.maxtemp_c,
                mintemp_c: day.day.mintemp_c,
                condition: day.day.condition,
                chance_of_rain: day.day.daily_chance_of_rain,
            },
        })),
    };

    res.status(200).json(forecastData);
};