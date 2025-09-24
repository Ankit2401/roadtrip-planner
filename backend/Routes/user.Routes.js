const express = require('express');
const router = express.Router();
const userController = require('../Controllers/User.Controllers.js');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');

// Public routes
router.get('/profile/:id', userController.getUserProfile);

// Protected routes (admin only - should add admin middleware)
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;