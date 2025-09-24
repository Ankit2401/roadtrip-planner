const express = require('express');
const router = express.Router();
const roadTripController = require('../Controllers/Roadtrip.Controllers.js');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');
const upload = require('../Config/Multer.js');

// Public routes (general access)
router.get('/', roadTripController.getAllRoadTrips);
router.get('/search', roadTripController.searchTrips);

// Protected routes for the logged-in user (specific, must come before generic ones)
router.get('/user/mytrips', authMiddleware, roadTripController.getMyTrips);

// Public dynamic routes (must come after specific routes)
router.get('/:id', roadTripController.getTripById);

// Protected routes (for creating, updating, and deleting)
router.post('/', authMiddleware, upload.array('images', 5), roadTripController.createRoadTrip);
router.put('/:id', authMiddleware, upload.array('images', 5), roadTripController.updateRoadTrip);
router.delete('/:id', authMiddleware, roadTripController.deleteRoadTrip);
router.put('/:id/like', authMiddleware, roadTripController.likeTrip);

module.exports = router;