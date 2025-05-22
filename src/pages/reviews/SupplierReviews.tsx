import React, { useEffect, useState } from 'react';
import { Review, ReviewFilters as ReviewFiltersType, getSupplierReviews } from '../../services/reviewService';
import ReviewList from './ReviewList';
import ReviewPagination from './ReviewPagination';
import ReviewFilters from './ReviewFilters';
import { useAuth } from '../../context/AuthContext';

const SupplierReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ReviewFiltersType>({
    rating: undefined,
    isApproved: undefined,
    isVerifiedPurchase: undefined,
    dateRange: undefined,
    search: undefined
  });
  const { user } = useAuth();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getSupplierReviews(currentPage, 10, filters);
      setReviews(response.reviews);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews. Please try again later.');
      console.error('Error fetching supplier reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: ReviewFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewReview = (review: Review) => {
    // Implement view review functionality
    console.log('View review:', review);
  };

  const handleEditReview = (review: Review) => {
    // Implement edit review functionality
    console.log('Edit review:', review);
  };

  const handleDeleteReview = (reviewId: string) => {
    // Implement delete review functionality
    console.log('Delete review:', reviewId);
  };

  if (!user || user.role !== 'supplier') {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You must be a supplier to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and respond to reviews for your products
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <ReviewFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            showApprovalFilter={false} // Suppliers can't approve reviews
          />
        </div>

        {error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchReviews}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No reviews found.</p>
          </div>
        ) : (
          <>
            <ReviewList
              reviews={reviews}
              isLoading={loading}
              onView={handleViewReview}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onVoteHelpful={() => {}} // Suppliers can't vote
              onToggleApproval={() => {}} // Suppliers can't approve
              onToggleVerified={() => {}} // Suppliers can't verify
              onApprove={() => {}} // Suppliers can't approve
              onVerify={() => {}} // Suppliers can't verify
              showActions={false} // Hide action buttons for suppliers
            />
            <div className="px-6 py-4 border-t border-gray-200">
              <ReviewPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalReviews={reviews.length}
                resultsPerPage={10}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierReviews; 