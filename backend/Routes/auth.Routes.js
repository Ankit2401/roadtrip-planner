const express = require('express');
const router = express.Router();
const authController = require('../Controllers/Auth.Controllers.js');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;