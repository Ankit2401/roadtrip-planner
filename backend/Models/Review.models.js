const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        minlength: [5, 'Review comment must be at least 5 characters long'],
        maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
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
    helpful: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    images: [{
        type: String
    }],
    tripDate: {
        type: Date,
        default: null
    },
    travelType: {
        type: String,
        enum: ['Solo', 'Couple', 'Family', 'Friends', 'Business'],
        default: 'Solo'
    },
    verified: {
        type: Boolean,
        default: false
    },
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

// Compound index to ensure one review per user per trip
ReviewSchema.index({ user: 1, roadTrip: 1 }, { unique: true });

// Other indexes for performance
ReviewSchema.index({ roadTrip: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

// Virtual for helpful count
ReviewSchema.virtual('helpfulCount').get(function() {
    return this.helpful ? this.helpful.length : 0;
});

// Pre-save middleware to handle editing
ReviewSchema.pre('save', function(next) {
    if ((this.isModified('comment') || this.isModified('rating')) && !this.isNew) {
        this.isEdited = true;
        this.editedAt = new Date();
    }
    next();
});

// Static method to calculate average rating for a trip
ReviewSchema.statics.calculateAverageRating = async function(roadTripId) {
    const result = await this.aggregate([
        { $match: { roadTrip: roadTripId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result[0] || { averageRating: 0, totalReviews: 0 };
};

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;