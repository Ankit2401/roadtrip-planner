
const express = require('express');
const router = express.Router();
const placesController = require('../Controllers/Places.Controllers.js');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');

// Protected routes
router.get('/', authMiddleware, placesController.getNearbyPlaces);

module.exports = router;
