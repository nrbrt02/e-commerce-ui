// src/pages/Reviews.tsx
import React, { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
import { 
  getCustomerReviews, 
  updateReview, 
  deleteReview, 
  voteReviewHelpful,
  toggleReviewApproval,
  toggleVerifiedPurchase,
  Review 
} from "../../services/reviewService";
import { showToast } from "../../components/ui/ToastProvider";
import ReviewList from "./ReviewList";
import ReviewFilters from "./ReviewFilters";
import ReviewPagination from "./ReviewPagination";
import ReviewDetailsModal from "./ReviewDetailsModal";
import ReviewEditModal from "./ReviewEditModal";

const Reviews: React.FC = () => {
//   const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCustomerReviews(currentPage, resultsPerPage);
      setReviews(response.data.reviews);
      setTotalReviews(response.pagination.totalReviews);
      setTotalPages(response.pagination.totalPages);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.response?.data?.message || "Failed to load reviews");
      setIsLoading(false);
      showToast.error("Failed to load reviews");
    }
  };

  const refreshReviews = async () => {
    setIsRefreshing(true);
    await fetchReviews();
    setIsRefreshing(false);
    showToast.info("Reviews refreshed");
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, resultsPerPage]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter(review => review.id !== reviewId));
      showToast.success("Review deleted successfully");
    } catch (err: any) {
      console.error("Error deleting review:", err);
      showToast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleUpdateReview = async (updatedReview: Review) => {
    try {
      const response = await updateReview(updatedReview.id, updatedReview);
      setReviews(reviews.map(review => 
        review.id === updatedReview.id ? response.data.review : review
      ));
      setIsEditModalOpen(false);
      showToast.success("Review updated successfully");
    } catch (err: any) {
      console.error("Error updating review:", err);
      showToast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  const handleVoteHelpful = async (reviewId: string) => {
    try {
      const response = await voteReviewHelpful(reviewId);
      setReviews(reviews.map(review => 
        review.id === reviewId ? response.data.review : review
      ));
      showToast.success("Thank you for your feedback!");
    } catch (err: any) {
      console.error("Error voting review:", err);
      showToast.error(err.response?.data?.message || "Failed to vote review");
    }
  };

  // New admin functions
  const handleToggleApproval = async (reviewId: string) => {
    try {
      const response = await toggleReviewApproval(reviewId);
      setReviews(reviews.map(review => 
        review.id === reviewId ? response.data.review : review
      ));
      showToast.success(`Review ${response.data.review.isApproved ? 'approved' : 'unapproved'}`);
    } catch (err: any) {
      console.error("Error toggling review approval:", err);
      showToast.error(err.response?.data?.message || "Failed to toggle approval");
    }
  };

  const handleToggleVerified = async (reviewId: string) => {
    try {
      const response = await toggleVerifiedPurchase(reviewId);
      setReviews(reviews.map(review => 
        review.id === reviewId ? response.data.review : review
      ));
      showToast.success(`Review marked as ${response.data.review.isVerifiedPurchase ? 'verified' : 'unverified'}`);
    } catch (err: any) {
      console.error("Error toggling verified status:", err);
      showToast.error(err.response?.data?.message || "Failed to toggle verified status");
    }
  };

  const openDetailsModal = (review: Review) => {
    setSelectedReview(review);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setSelectedReview(review);
    setIsEditModalOpen(true);
  };

  const filteredReviews = reviews.filter(review => {
    // Apply search term filter
    const matchesSearch = 
      searchTerm === "" ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply rating filter
    const matchesRating = 
      ratingFilter === null || review.rating === ratingFilter;

    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "approved" && review.isApproved) ||
      (statusFilter === "pending" && !review.isApproved);

    return matchesSearch && matchesRating && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">My Reviews</h1>
          <button
            onClick={refreshReviews}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            disabled={isRefreshing}
          >
            <svg
              className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <ReviewFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        resultsPerPage={resultsPerPage}
        setResultsPerPage={setResultsPerPage}
      />

      {/* Reviews List */}
      <ReviewList
        reviews={filteredReviews}
        isLoading={isLoading}
        onView={openDetailsModal}
        onEdit={openEditModal}
        onDelete={handleDeleteReview}
        onVoteHelpful={handleVoteHelpful}
        onToggleApproval={handleToggleApproval}
        onToggleVerified={handleToggleVerified}
      />

      {/* Pagination */}
      {!isLoading && reviews.length > 0 && (
        <ReviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalReviews={totalReviews}
          resultsPerPage={resultsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modals */}
      {selectedReview && (
        <>
          <ReviewDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            review={selectedReview}
          />
          <ReviewEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            review={selectedReview}
            onSave={handleUpdateReview}
          />
        </>
      )}
    </div>
  );
};

export default Reviews;