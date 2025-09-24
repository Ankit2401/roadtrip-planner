const express = require('express');
const router = express.Router();
const commentController = require('../Controllers/Comment.Controllers.js');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');

// Public routes
router.get('/:tripId', commentController.getCommentsForTrip);

// Protected routes
router.post('/:tripId', authMiddleware, commentController.createComment);
router.put('/:commentId', authMiddleware, commentController.updateComment);
router.delete('/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;