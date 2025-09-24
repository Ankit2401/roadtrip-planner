const mongoose = require('mongoose');

const RoadTripSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    coverImage: {
        type: String,
        default: '/default_cover_image.jpg'
    },
    images: [{ 
        type: String
    }],
    route: [{
        locationName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        estimatedDuration: String, // e.g., "2 hours"
        attractions: [String]
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    duration: {
        type: String,
        trim: true // e.g., "3-5 days"
    },
    season: [{
        type: String,
        enum: ['Spring', 'Summer', 'Autumn', 'Winter']
    }],
    budget: {
        min: {
            type: Number,
            min: 0
        },
        max: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD',
            uppercase: true
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    saves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    views: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
RoadTripSchema.index({ createdBy: 1 });
RoadTripSchema.index({ createdAt: -1 });
RoadTripSchema.index({ title: 'text', description: 'text' });
RoadTripSchema.index({ tags: 1 });
RoadTripSchema.index({ 'route.locationName': 1 });
RoadTripSchema.index({ likes: 1 });
RoadTripSchema.index({ isPublic: 1, status: 1 });

// Virtual for like count
RoadTripSchema.virtual('likeCount').get(function() {
    return this.likes ? this.likes.length : 0;
});

// Virtual for comment count  
RoadTripSchema.virtual('commentCount').get(function() {
    return this.comments ? this.comments.length : 0;
});

// Virtual for review count
RoadTripSchema.virtual('reviewCount').get(function() {
    return this.reviews ? this.reviews.length : 0;
});

// Virtual for average rating
RoadTripSchema.virtual('averageRating').get(function() {
    // This would need to be populated or calculated separately
    return this.avgRating || 0;
});

// Pre-save middleware to update tags
RoadTripSchema.pre('save', function(next) {
    if (this.tags && this.tags.length > 0) {
        this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
        // Remove duplicates
        this.tags = [...new Set(this.tags)];
    }
    next();
});

// Method to increment views
RoadTripSchema.methods.incrementViews = function() {
    this.views = (this.views || 0) + 1;
    return this.save();
};

const RoadTrip = mongoose.model('RoadTrip', RoadTripSchema);
module.exports = RoadTrip;