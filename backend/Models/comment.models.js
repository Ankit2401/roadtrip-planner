const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true,
        minlength: [1, 'Comment cannot be empty'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roadTrip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoadTrip',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
CommentSchema.index({ roadTrip: 1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

// Virtual for like count
CommentSchema.virtual('likeCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Virtual for reply count
CommentSchema.virtual('replyCount').get(function() {
    return this.replies ? this.replies.length : 0;
});

// Pre-save middleware to handle editing
CommentSchema.pre('save', function(next) {
    if (this.isModified('text') && !this.isNew) {
        this.isEdited = true;
        this.editedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Comment', CommentSchema);