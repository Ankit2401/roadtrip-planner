const Comment = require('../Models/comment.models.js');
const RoadTrip = require('../Models/RoadTrip.models.js');

// Helper function for consistent server error responses
const handleServerError = (res, err, message) => {
    console.error(`${message}:`, err.message);
    res.status(500).json({ message, error: err.message });
};

// Input validation
const validateComment = (text) => {
    if (!text || text.trim() === '') {
        return { isValid: false, message: 'Comment text cannot be empty.' };
    }
    if (text.trim().length > 500) {
        return { isValid: false, message: 'Comment text must be less than 500 characters.' };
    }
    return { isValid: true };
};

// Get all comments for a trip with pagination
exports.getCommentsForTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const comments = await Comment.find({ trip: tripId }).populate('user', 'username');
    res.json(comments); // <-- send array directly
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { tripId } = req.params;
        const userId = req.user.id;

        const validation = validateComment(text);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const roadTrip = await RoadTrip.findById(tripId);
        if (!roadTrip) {
            return res.status(404).json({ message: 'Trip not found.' });
        }

        const newComment = new Comment({
            text: text.trim(),
            user: userId,
            roadTrip: tripId,
        });

        const savedComment = await newComment.save();
        await savedComment.populate('user', 'username name');

        // Add comment to the trip's comments array
        roadTrip.comments.unshift(savedComment._id);
        await roadTrip.save();

        res.status(201).json(savedComment);
    } catch (err) {
        handleServerError(res, err, 'Error creating comment');
    }
};

// Update comment
exports.updateComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { commentId } = req.params;
        const userId = req.user.id;

        const validation = validateComment(text);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const commentToUpdate = await Comment.findById(commentId);
        if (!commentToUpdate) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the user is the owner of the comment
        if (commentToUpdate.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this comment.' });
        }

        commentToUpdate.text = text.trim();
        await commentToUpdate.save();
        await commentToUpdate.populate('user', 'username name');

        res.json(commentToUpdate);
    } catch (err) {
        handleServerError(res, err, 'Error updating comment');
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const commentToDelete = await Comment.findById(commentId);
        if (!commentToDelete) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Check if the user is the owner of the comment
        if (commentToDelete.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment.' });
        }

        // Concurrently remove the comment and update the road trip
        await Promise.all([
            Comment.findOneAndDelete({ _id: commentId }),
            RoadTrip.findByIdAndUpdate(commentToDelete.roadTrip, {
                $pull: { comments: commentId }
            })
        ]);

        res.status(204).send();
    } catch (err) {
        handleServerError(res, err, 'Error deleting comment');
    }
};