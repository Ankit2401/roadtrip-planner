const Review = require('../Models/Review.Models');

// READ all reviews for the authenticated user
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [userReviews, totalCount] = await Promise.all([
      Review.find({ user: userId })
        .populate('roadTrip', 'title startDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ user: userId })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      reviews: userReviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
};

// CREATE review
exports.createReview = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rating, comment } = req.body;

    const review = new Review({
      roadTrip: tripId,
      user: req.user.id,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// UPDATE review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: req.user.id },
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found or not yours' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// DELETE review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({ _id: reviewId, user: req.user.id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or not yours' });
    }

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};
