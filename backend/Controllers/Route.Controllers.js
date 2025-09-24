const axios = require('axios');
const polyline = require('@mapbox/polyline');

// Cache for route data
const routeCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper function for consistent error responses
const handleServerError = (res, err, message) => {
    console.error(`${message}:`, err.response?.data || err.message);
    if (err.code === 'ECONNABORTED') {
        res.status(408).json({ message: 'Route service request timed out.' });
    } else if (err.message.includes('Could not find coordinates')) {
        res.status(404).json({ message: err.message });
    } else {
        res.status(500).json({ message: 'Error fetching route data.' });
    }
};

// Helper function to get coordinates from a location name
const getCoordinates = async (locationName, apiKey) => {
    const geoResponse = await axios.get(
        `https://api.openrouteservice.org/geocode/search`,
        {
            params: { api_key: apiKey, text: locationName, size: 1 },
            timeout: 5000,
        }
    );

    if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
        throw new Error(`Could not find coordinates for "${locationName}".`);
    }
    return geoResponse.data.features[0].geometry.coordinates;
};

// Helper function to process and format route data
const processRouteData = (route, startLocationName, endLocationName, startCoords, endCoords) => {
    let decodedPolyline = [];
    try {
        decodedPolyline = polyline.decode(route.geometry);
    } catch (decodeError) {
        console.error('Polyline decode error:', decodeError.message);
        decodedPolyline = [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]];
    }

    const instructions = route.segments?.[0]?.steps?.map(step => ({
        instruction: step.instruction,
        distance: (step.distance / 1000).toFixed(2), // km
        duration: (step.duration / 60).toFixed(1),   // minutes
    })) || [];

    return {
        distance: (route.summary.distance / 1000).toFixed(2), // km
        duration: (route.summary.duration / 3600).toFixed(2), // hours
        polyline: decodedPolyline,
        instructions,
        startLocation: { name: startLocationName, coordinates: startCoords },
        endLocation: { name: endLocationName, coordinates: endCoords },
    };
};

exports.getRoute = async (req, res) => {
    const { startLocationName, endLocationName, profile = 'driving-car' } = req.body;

    if (!startLocationName || !endLocationName) {
        return res.status(400).json({ message: 'Start and end location names are required.' });
    }
    if (startLocationName.trim() === endLocationName.trim()) {
        return res.status(400).json({ message: 'Start and end locations cannot be the same.' });
    }

    const cacheKey = `${startLocationName.toLowerCase()}-${endLocationName.toLowerCase()}-${profile}`;
    const cached = routeCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.status(200).json(cached.data);
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'OpenRouteService API key not configured on the server.' });
    }

    try {
        const [startCoords, endCoords] = await Promise.all([
            getCoordinates(startLocationName, apiKey),
            getCoordinates(endLocationName, apiKey)
        ]);

        const routeResponse = await axios.post(
            `https://api.openrouteservice.org/v2/directions/${profile}`,
            { coordinates: [startCoords, endCoords] },
            {
                headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        if (!routeResponse.data.routes || routeResponse.data.routes.length === 0) {
            return res.status(404).json({ message: 'Route could not be calculated between these points.' });
        }

        const route = routeResponse.data.routes[0];
        const processedData = processRouteData(route, startLocationName, endLocationName, startCoords, endCoords);

        routeCache.set(cacheKey, { data: processedData, timestamp: Date.now() });

        res.json(processedData);
    } catch (error) {
        handleServerError(res, error, 'Route Service Error');
    }
};