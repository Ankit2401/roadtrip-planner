const axios = require('axios');

// Cache for places data
const placesCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Helper function to handle API requests with robust error handling
const fetchGeoApiData = async (url, params, errorMessage, res) => {
    try {
        const response = await axios.get(url, { params, timeout: 5000 });
        if (response.data.features && response.data.features.length > 0) {
            return response.data;
        }
        res.status(404).json({ message: errorMessage });
        return null;
    } catch (error) {
        console.error('Geoapify API Error:', error.response?.data || error.message);
        if (error.code === 'ECONNABORTED') {
            res.status(408).json({ message: 'Request to Geoapify timed out' });
        } else {
            res.status(500).json({ message: 'Failed to communicate with Geoapify service' });
        }
        return null;
    }
};

exports.getNearbyPlaces = async (req, res) => {
    const { location, radius = 5000, limit = 6 } = req.query;

    if (!location || location.trim() === '') {
        return res.status(400).json({ message: 'Location query parameter is required.' });
    }

    const cacheKey = `${location.toLowerCase()}-${radius}-${limit}`;
    const cachedData = placesCache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        return res.status(200).json(cachedData.data);
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Geoapify API key is not configured on the server.' });
    }

    try {
        const geoData = await fetchGeoApiData(
            `https://api.geoapify.com/v1/geocode/search`,
            { text: location, apiKey, limit: 1 },
            `Could not find coordinates for location: ${location}`,
            res
        );

        if (!geoData) {
            return;
        }

        const { lon, lat } = geoData.features[0].properties;

        const placesData = await fetchGeoApiData(
            `https://api.geoapify.com/v2/places`,
            {
                categories: 'tourism.attraction,entertainment,catering.restaurant,accommodation',
                filter: `circle:${lon},${lat},${radius}`,
                bias: `proximity:${lon},${lat}`,
                limit: limit,
                apiKey
            },
            `No nearby places found for ${location}`,
            res
        );

        if (!placesData) {
            return;
        }

        const formattedPlaces = placesData.features.map(place => {
            const { place_id, name, address_line2, address_line1, categories, distance, rating, opening_hours } = place.properties;
            const primaryCategory = categories?.find(c => c.startsWith('tourism')) || categories?.[0] || 'Attraction';
            const coordinates = place.geometry.coordinates;

            return {
                id: place_id,
                name: name || 'Unnamed Place',
                address: address_line2 || address_line1 || '',
                category: primaryCategory,
                coordinates,
                distance,
                rating,
                opening_hours
            };
        }).filter(place => place.name !== 'Unnamed Place');

        const finalResult = {
            location: geoData.features[0].properties.formatted,
            coordinates: [lon, lat],
            places: formattedPlaces
        };

        placesCache.set(cacheKey, { data: finalResult, timestamp: Date.now() });

        res.json(finalResult);
    } catch (error) {
        console.error('Unexpected error in getNearbyPlaces:', error);
        res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
};