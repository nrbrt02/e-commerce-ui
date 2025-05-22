import React, { useState } from 'react';
import { ReviewFilters as ReviewFiltersType } from '../../services/reviewService';

interface ReviewFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  resultsPerPage: number;
  setResultsPerPage: (count: number) => void;
  showApprovalFilter?: boolean;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  ratingFilter,
  setRatingFilter,
  statusFilter,
  setStatusFilter,
  resultsPerPage,
  setResultsPerPage,
  showApprovalFilter = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter(null);
    setStatusFilter("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
          <button
            onClick={clearFilters}
            className="text-sm text-sky-600 hover:text-sky-700"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <select
            value={ratingFilter || ''}
            onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white transition-colors duration-200 hover:border-gray-400"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} {rating === 1 ? 'Star' : 'Stars'}
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews..."
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm px-4 py-2 bg-white transition-colors duration-200 hover:border-gray-400"
          />
        </div>

        {isExpanded && (
          <>
            {/* Approval Filter (Admin only) */}
            {showApprovalFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white transition-colors duration-200 hover:border-gray-400"
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            )}

            {/* Results per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Results per page
              </label>
              <select
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white transition-colors duration-200 hover:border-gray-400"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewFilters;