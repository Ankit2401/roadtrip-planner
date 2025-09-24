import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripById, likeTrip } from '../../api/tripService';
import { getCommentsForTrip, createComment, updateComment, deleteComment } from '../../api/commentService';
import { getReviewsForTrip, createReview, updateReview, deleteReview } from '../../api/reviewService';
import { AuthContext } from '../../context/AuthContext';
import WeatherWidget from '../widgets/WeatherWidget';
import PlacesWidget from '../widgets/PlacesWidget';
import LoadingSpinner from '../shared/LoadingSpinner';
import './Trip.css';

const TripDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(null);
  
  // Review form state
  const [reviewFormData, setReviewFormData] = useState({ comment: '', rating: 5 });
  const [isEditingReview, setIsEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tripData, commentsData, reviewsData] = await Promise.all([
        getTripById(id),
        getCommentsForTrip(id),
        getReviewsForTrip(id)
      ]);
      
      setTrip(tripData);
      setComments(commentsData.comments || []);
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      setError('Failed to load trip details');
      console.error('Error fetching trip details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('You must be logged in to like a trip.');
      return;
    }
    
    try {
      const { likes } = await likeTrip(trip._id);
      setTrip(prevTrip => ({
        ...prevTrip,
        likes: likes,
      }));
    } catch (err) {
      console.error('Error liking trip:', err);
      alert('Failed to like trip. Please try again.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to comment.');
      return;
    }
    
    if (!commentText.trim()) {
      alert('Please enter a comment.');
      return;
    }

    try {
      if (isEditingComment) {
        const updatedComment = await updateComment(isEditingComment, commentText);
        setComments(comments.map(c => c._id === updatedComment._id ? updatedComment : c));
        setIsEditingComment(null);
      } else {
        const newComment = await createComment(id, commentText);
        setComments([newComment, ...comments]);
      }
      setCommentText('');
    } catch (err) {
      console.error('Error with comment:', err);
      alert('Failed to save comment. Please try again.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to post a review.');
      return;
    }

    if (!reviewFormData.comment.trim() || !reviewFormData.rating) {
      alert('Please provide both a rating and comment.');
      return;
    }

    try {
      if (isEditingReview) {
        const updatedReview = await updateReview(isEditingReview, reviewFormData);
        setReviews(reviews.map(r => r._id === updatedReview._id ? updatedReview : r));
        setIsEditingReview(null);
      } else {
        const newReview = await createReview(id, reviewFormData);
        setReviews([newReview, ...reviews]);
      }
      
      setReviewFormData({ comment: '', rating: 5 });
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error with review:', err);
      alert(err.message || 'Failed to save review. Please try again.');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Please try again.');
    }
  };

  const startEditComment = (comment) => {
    setIsEditingComment(comment._id);
    setCommentText(comment.text);
  };

  const startEditReview = (review) => {
    setIsEditingReview(review._id);
    setReviewFormData({
      comment: review.comment,
      rating: review.rating
    });
    setShowReviewForm(true);
  };

  const cancelEdit = () => {
    setIsEditingComment(null);
    setIsEditingReview(null);
    setCommentText('');
    setReviewFormData({ comment: '', rating: 5 });
    setShowReviewForm(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading trip details..." />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Error Loading Trip</h2>
          <p>{error}</p>
          <button onClick={fetchAllData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Trip Not Found</h2>
          <p>The trip you're looking for doesn't exist or has been removed.</p>
          <Link to="/trips" className="btn btn-primary">
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  const userHasLiked = user && trip.likes.some(like => like.toString() === user._id);
  const userHasReviewed = user && reviews.some(review => review.user._id === user._id);
  const isOwner = user && trip.createdBy._id === user._id;

  // Get first route location for weather/places
  const firstLocation = trip.route && trip.route.length > 0 ? trip.route[0].locationName : null;

  return (
    <div className="container trip-details-container">
      <div className="trip-details-header">
        <h1 className="trip-details-title">{trip.title}</h1>
        <div className="trip-details-meta">
          <span className="trip-author">
            By: <Link to={`/users/${trip.createdBy._id}`}>{trip.createdBy.name}</Link>
          </span>
          <span className="trip-date">
            {new Date(trip.createdAt).toLocaleDateString()}
          </span>
          {isOwner && (
            <div className="trip-owner-actions">
              <Link to={`/edit-trip/${trip._id}`} className="btn btn-secondary">
                Edit Trip
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="trip-details-content">
        <div className="trip-main-content">
          {trip.coverImage && (
            <img 
              src={trip.coverImage} 
              alt={trip.title} 
              className="trip-details-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          
          <div className="trip-description-section">
            <p className="trip-details-description">{trip.description}</p>
          </div>

          {trip.route && trip.route.length > 0 && (
            <div className="trip-route-section">
              <h3>Route</h3>
              <div className="route-list">
                {trip.route.map((stop, index) => (
                  <div key={index} className="route-stop">
                    <div className="route-stop-number">{index + 1}</div>
                    <div className="route-stop-info">
                      <h4>{stop.locationName}</h4>
                      {stop.description && <p>{stop.description}</p>}
                      {stop.estimatedDuration && (
                        <span className="duration">Duration: {stop.estimatedDuration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="trip-actions-section">
            <div className="trip-stats">
              <span className="stat-item">
                <strong>Likes:</strong> {trip.likes.length}
              </span>
              <span className="stat-item">
                <strong>Comments:</strong> {comments.length}
              </span>
              <span className="stat-item">
                <strong>Reviews:</strong> {reviews.length}
              </span>
            </div>
            
            {user && (
              <div className="trip-actions">
                <button 
                  onClick={handleLike} 
                  className={`btn ${userHasLiked ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {userHasLiked ? '❤️ Liked' : '🤍 Like'}
                </button>
                
                {!userHasReviewed && !isOwner && (
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="btn btn-primary"
                  >
                    Write Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="trip-sidebar">
          {firstLocation && (
            <>
              <WeatherWidget location={firstLocation} />
              <PlacesWidget location={firstLocation} />
            </>
          )}
        </div>
      </div>

      <div className="trip-interactions">
        {/* Comments Section */}
        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>
          
          {user && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                required
                rows="3"
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {isEditingComment ? 'Update Comment' : 'Post Comment'}
                </button>
                {isEditingComment && (
                  <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="empty-state">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <strong>{comment.user.name}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  
                  {user && comment.user._id === user._id && (
                    <div className="comment-actions">
                      <button onClick={() => startEditComment(comment)}>
                        Edit
                      </button>
                      <button onClick={() => handleCommentDelete(comment._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>Reviews ({reviews.length})</h3>
          
          {showReviewForm && user && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label>Rating:</label>
                <select
                  value={reviewFormData.rating}
                  onChange={(e) => setReviewFormData({
                    ...reviewFormData,
                    rating: parseInt(e.target.value)
                  })}
                  required
                >
                  {[5, 4, 3, 2, 1].map(rating => (
                    <option key={rating} value={rating}>
                      {'⭐'.repeat(rating)} ({rating} star{rating !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Review:</label>
                <textarea
                  value={reviewFormData.comment}
                  onChange={(e) => setReviewFormData({
                    ...reviewFormData,
                    comment: e.target.value
                  })}
                  placeholder="Share your experience with this trip..."
                  required
                  rows="4"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {isEditingReview ? 'Update Review' : 'Submit Review'}
                </button>
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="empty-state">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="review-author">
                      <strong>{review.user.name}</strong>
                      <div className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  
                  {user && review.user._id === user._id && (
                    <div className="review-actions">
                      <button onClick={() => startEditReview(review)}>
                        Edit
                      </button>
                      <button onClick={() => handleReviewDelete(review._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;