// src/components/products/ProductReviews.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

interface ReviewCustomer {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
}

interface Review {
  id: number;
  productId: number;
  customerId: number;
  orderId?: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  media?: string[];
  createdAt: string;
  updatedAt: string;
  customer: ReviewCustomer;
}

interface PaginationInfo {
  totalReviews: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface ProductReviewsProps {
  productId: number | string;
  initialRating?: number;
  reviewCount?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  initialRating = 0,
  reviewCount = 0,
}) => {
  const { user, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    rating: number | null;
    verified: boolean;
    sort: "newest" | "helpful";
  }>({
    rating: null,
    verified: false,
    sort: "newest",
  });
  const [ratingStats, setRatingStats] = useState({
    average: initialRating,
    count: reviewCount,
    distribution: [0, 0, 0, 0, 0],
  });
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    fetchReviews(1);
    fetchReviewStats();
  }, [productId, filter]);

  const fetchReviews = async (page: number) => {
    setLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "5");
      
      if (filter.rating !== null) {
        params.append("rating", filter.rating.toString());
      }
      
      if (filter.verified) {
        params.append("verified", "true");
      }
      
      if (filter.sort === "helpful") {
        params.append("sort", "helpfulVotes");
      }

      const endpoint = `${apiBaseUrl}/products/${productId}/reviews?${params.toString()}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setReviews(data.data.reviews);
        setPagination(data.pagination);
      } else {
        throw new Error("Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const endpoint = `${apiBaseUrl}/products/${productId}/reviews/stats`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        console.error(`Error fetching review stats: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        setRatingStats({
          average: data.data.averageRating,
          count: data.data.totalReviews,
          distribution: data.data.ratingDistribution,
        });
      }
    } catch (err) {
      console.error("Error fetching review stats:", err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      openAuthModal("login");
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const token = localStorage.getItem("fast_shopping_token");
      
      if (!token) {
        throw new Error("You must be logged in to submit a review");
      }

      const endpoint = `${apiBaseUrl}/products/${productId}/reviews`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setSubmitSuccess(true);
      
      // Reset form
      setNewReview({
        rating: 5,
        title: "",
        comment: "",
      });
      
      setShowWriteReview(false);
      
      // Refresh reviews and stats after a successful submission
      fetchReviews(1);
      fetchReviewStats();
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId: number) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    try {
      const token = localStorage.getItem("fast_shopping_token");
      
      if (!token) {
        throw new Error("You must be logged in to vote");
      }

      const endpoint = `${apiBaseUrl}/reviews/${reviewId}/vote`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to vote review as helpful");
      }

      const data = await response.json();

      // Update the helpfulVotes count in the UI
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulVotes: data.data.helpfulVotes } 
          : review
      ));
    } catch (err) {
      console.error("Error voting review as helpful:", err);
      // Show error notification
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.floor(rating) ? (
              <i className="fas fa-star text-yellow-400"></i>
            ) : star === Math.ceil(rating) && !Number.isInteger(rating) ? (
              <i className="fas fa-star-half-alt text-yellow-400"></i>
            ) : (
              <i className="far fa-star text-gray-300"></i>
            )}
          </span>
        ))}
      </div>
    );
  };

  const getRatingPercentage = (ratingIndex: number) => {
    if (ratingStats.count === 0) return 0;
    return (ratingStats.distribution[ratingIndex] / ratingStats.count) * 100;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getDisplayName = (customer: ReviewCustomer) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    } else {
      return customer.username;
    }
  };

  return (
    <div className="py-6">
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
          <i className="fas fa-check-circle text-green-500"></i>
          <p>Thank you for your review! It will be published after moderation.</p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
          <i className="fas fa-exclamation-circle text-red-500"></i>
          <p>{submitError}</p>
        </div>
      )}

      {/* Review Summary */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-gray-200 pb-8">
        <div className="md:w-1/3">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800 mb-1">
              {ratingStats.average.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(ratingStats.average)}
            </div>
            <p className="text-gray-500 text-sm">
              Based on {ratingStats.count} reviews
            </p>
          </div>
        </div>

        <div className="md:w-2/3">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center">
                <button 
                  onClick={() => setFilter(prev => ({ 
                    ...prev, 
                    rating: prev.rating === star ? null : star 
                  }))}
                  className={`w-12 text-sm ${filter.rating === star ? 'font-bold text-sky-600' : 'text-gray-500'}`}
                >
                  {star} stars
                </button>
                <div className="flex-grow mx-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full"
                    style={{ width: `${getRatingPercentage(star - 1)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {ratingStats.distribution[star - 1]}
                </span>
              </div>
            ))}
          </div>

          {user ? (
            <button
              onClick={() => setShowWriteReview(!showWriteReview)}
              className="mt-6 w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition-colors"
            >
              {showWriteReview ? "Cancel" : "Write a Review"}
            </button>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="mt-6 w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition-colors"
            >
              Login to Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Write a review form */}
      {showWriteReview && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="text-2xl"
                    aria-label={`Rate ${star} stars`}
                  >
                    <i 
                      className={`${
                        star <= newReview.rating ? "fas" : "far"
                      } fa-star ${
                        star <= newReview.rating ? "text-yellow-400" : "text-gray-300"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="reviewTitle" className="block text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                id="reviewTitle"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="Summarize your experience"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="reviewComment" className="block text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                id="reviewComment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="What did you like or dislike about this product?"
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-sky-600 text-white py-3 px-6 rounded-md font-medium hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex gap-4 mb-4 md:mb-0">
          <button
            onClick={() => setFilter({ ...filter, sort: "newest" })}
            className={`text-sm px-3 py-2 rounded-md transition-colors ${
              filter.sort === "newest"
                ? "bg-sky-50 text-sky-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Most Recent
          </button>
          <button
            onClick={() => setFilter({ ...filter, sort: "helpful" })}
            className={`text-sm px-3 py-2 rounded-md transition-colors ${
              filter.sort === "helpful"
                ? "bg-sky-50 text-sky-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Most Helpful
          </button>
          <button
            onClick={() => setFilter({ ...filter, verified: !filter.verified })}
            className={`text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-1 ${
              filter.verified
                ? "bg-sky-50 text-sky-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-check text-xs"></i>
            Verified Purchases
          </button>
        </div>

        {filter.rating !== null && (
          <button
            onClick={() => setFilter({ ...filter, rating: null })}
            className="text-sky-600 hover:text-sky-700 text-sm font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Reviews list */}
      {loading && reviews.length === 0 ? (
        <div className="py-6">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-circle text-4xl"></i>
          </div>
          <p className="text-gray-700 mb-3">{error}</p>
          <button
            onClick={() => fetchReviews(1)}
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-10 text-center border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-xl font-medium text-gray-700 mb-3">No Reviews Yet</h3>
          <p className="text-gray-500 mb-6">Be the first to review this product</p>
          {user ? (
            <button
              onClick={() => setShowWriteReview(true)}
              className="bg-sky-600 text-white py-2 px-6 rounded-md hover:bg-sky-700 transition-colors"
            >
              Write a Review
            </button>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="bg-sky-600 text-white py-2 px-6 rounded-md hover:bg-sky-700 transition-colors"
            >
              Login to Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {review.customer.avatar ? (
                    <img
                      src={review.customer.avatar}
                      alt={getDisplayName(review.customer)}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-medium text-lg">
                      {getDisplayName(review.customer).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">
                    {getDisplayName(review.customer)}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span>{formatDate(review.createdAt)}</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-green-600 flex items-center gap-1">
                        <i className="fas fa-check text-xs"></i>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {review.title && (
                <h3 className="text-lg font-medium text-gray-800 mb-2">{review.title}</h3>
              )}

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {review.media && review.media.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.media.map((url, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 border border-gray-200 rounded overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <button
                  onClick={() => handleVoteHelpful(review.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-sky-600 transition-colors"
                >
                  <i className="far fa-thumbs-up text-sm"></i>
                  Helpful ({review.helpfulVotes})
                </button>
                <span className="text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => fetchReviews(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, and pages around current page
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                // Add ellipsis if there's a gap
                const showEllipsis = prevPage && page - prevPage > 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-3 py-2 border border-gray-300 rounded-md text-gray-400">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => fetchReviews(page)}
                      className={`px-3 py-2 border rounded-md ${
                        currentPage === page
                          ? "bg-sky-600 text-white border-sky-600"
                          : "text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
            
            <button
              onClick={() => fetchReviews(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;