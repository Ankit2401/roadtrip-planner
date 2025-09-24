const RoadTrip = require('../Models/Roadtrip.models.js');
const cloudinary = require('../Config/Cloudinary.js');
const mongoose = require('mongoose');

// Input validation helper
const validateTripInput = (title, description) => {
    if (!title || title.trim().length < 3) {
        return { isValid: false, message: 'Title must be at least 3 characters long' };
    }
    if (!description || description.trim().length < 10) {
        return { isValid: false, message: 'Description must be at least 10 characters long' };
    }
    return { isValid: true };
};

// Create a new road trip
exports.createRoadTrip = async (req, res) => {
    try {
        const { title, description, route } = req.body;
        const validation = validateTripInput(title, description);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                const uploadPromises = req.files.map(file => {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    let dataURI = "data:" + file.mimetype + ";base64," + b64;
                    return cloudinary.uploader.upload(dataURI, {
                        folder: "roadtrips",
                        transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto:good" }]
                    });
                });
                const results = await Promise.all(uploadPromises);
                imageUrls = results.map(result => result.secure_url);
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(500).json({ message: 'Error uploading images' });
            }
        }

        const parsedRoute = typeof route === 'string' ? JSON.parse(route) : route;
        const newTrip = new RoadTrip({
            title: title.trim(),
            description: description.trim(),
            createdBy: req.user.id, // Correctly using req.user.id
            route: parsedRoute,
            coverImage: imageUrls[0] || '/default_cover_image.jpg',
            images: imageUrls
        });

        const trip = await newTrip.save();
        await trip.populate('createdBy', 'username name');
        res.status(201).json(trip);
    } catch (err) {
        console.error("Create trip error:", err);
        res.status(500).json({ message: 'Error creating trip', error: err.message });
    }
};

// Update road trip
exports.updateRoadTrip = async (req, res) => {
    try {
        const { title, description, route } = req.body;
        const validation = validateTripInput(title, description);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        let parsedRoute = route;
        if (route && typeof route === 'string') {
            try {
                parsedRoute = JSON.parse(route);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid route data format.' });
            }
        }

        const updateData = {
            title: title.trim(),
            description: description.trim(),
            route: parsedRoute
        };

        if (req.files && req.files.length > 0) {
            try {
                const uploadPromises = req.files.map(file => {
                    const b64 = Buffer.from(file.buffer).toString("base64");
                    let dataURI = "data:" + file.mimetype + ";base64," + b64;
                    return cloudinary.uploader.upload(dataURI, {
                        folder: "roadtrips",
                        transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto:good" }]
                    });
                });
                const results = await Promise.all(uploadPromises);
                const imageUrls = results.map(result => result.secure_url);
                if (imageUrls.length > 0) {
                    updateData.images = imageUrls;
                    updateData.coverImage = imageUrls[0];
                }
            } catch (uploadError) {
                console.error("Image upload error:", uploadError);
                return res.status(500).json({ message: 'Error uploading images' });
            }
        }

        const trip = await RoadTrip.findByIdAndUpdate(
            req.params.id, { $set: updateData }, { new: true }
        ).populate('createdBy', 'username name');
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.json(trip);
    } catch (err) {
        console.error("Update trip error:", err);
        res.status(500).json({ message: 'Error updating trip', error: err.message });
    }
};

// READ all road trips with pagination
exports.getAllRoadTrips = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const trips = await RoadTrip.find()
            .populate('createdBy', 'username name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await RoadTrip.countDocuments();

        res.status(200).json({
            trips,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalTrips: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Get all trips error:", error);
        res.status(500).json({ message: 'Error fetching trips', error: error.message });
    }
};

// DELETE a road trip by ID
exports.deleteRoadTrip = async (req, res) => {
    try {
        const trip = await RoadTrip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user owns the trip
        if (trip.createdBy.equals(req.user.id)) {
            await RoadTrip.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } else {
            return res.status(403).json({ message: 'Not authorized to delete this trip' });
        }
    } catch (error) {
        console.error("Delete trip error:", error);
        res.status(500).json({ message: 'Error deleting trip', error: error.message });
    }
};

// GET a single road trip by its ID
exports.getTripById = async (req, res) => {
    try {
        const trip = await RoadTrip.findById(req.params.id)
            .populate('createdBy', 'username name')
            .populate({ path: 'comments', populate: { path: 'user', select: 'username name' } })
            .populate({ path: 'reviews', populate: { path: 'user', select: 'username name' } });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.status(200).json(trip);
    } catch (error) {
        console.error("Get trip by ID error:", error);
        res.status(500).json({ message: 'Error fetching trip', error: error.message });
    }
};

// Like/Unlike a trip
exports.likeTrip = async (req, res) => {
    try {
        const trip = await RoadTrip.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const userLiked = trip.likes.some(like => like.toString() === req.user.id);
        if (userLiked) {
            trip.likes = trip.likes.filter(like => like.toString() !== req.user.id);
        } else {
            trip.likes.push(req.user.id);
        }

        await trip.save();
        res.json({ likes: trip.likes, liked: !userLiked });
    } catch (err) {
        console.error("Like trip error:", err);
        res.status(500).json({ message: 'Error liking trip', error: err.message });
    }
};

// GET all trips for the logged-in user
exports.getMyTrips = async (req, res) => {
    try {
        // Correctly casting the user ID to a MongoDB ObjectId
        const trips = await RoadTrip.find({ createdBy: new mongoose.Types.ObjectId(req.user.id) })
            .populate('createdBy', 'username name')
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        console.error("Get my trips error:", err);
        res.status(500).json({ message: 'Error fetching your trips', error: err.message });
    }
};

// Search trips
exports.searchTrips = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const trips = await RoadTrip.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { 'route.locationName': { $regex: q, $options: 'i' } }
                ]
            }).populate('createdBy', 'username name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(trips);
    } catch (error) {
        console.error("Search trips error:", error);
        res.status(500).json({ message: 'Error searching trips', error: error.message });
    }
};