const express = require('express');
const router = express.Router();
const weatherController = require('../Controllers/Weather.Controllers.js'); 

// Public routes
router.get('/', weatherController.getWeatherByLocation);
router.get('/forecast', weatherController.getWeatherForecast);

module.exports = router;