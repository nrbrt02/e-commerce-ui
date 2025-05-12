import React from "react";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ReviewFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  ratingFilter: number | null;
  setRatingFilter: (rating: number | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  resultsPerPage: number;
  setResultsPerPage: (count: number) => void;
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
}) => {
  const hasFilters = searchTerm || ratingFilter !== null || statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter(null);
    setStatusFilter("all");
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Reviews
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              placeholder="Search by title or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                className={`p-1 rounded-md ${ratingFilter === rating ? 'bg-yellow-100' : 'hover:bg-gray-100'}`}
                title={`${rating} star${rating > 1 ? 's' : ''}`}
              >
                <StarIcon
                  className={`h-5 w-5 ${ratingFilter === rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                />
                <span className="sr-only">{rating} star{rating > 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>

        {/* Results per page */}
        <div className="md:col-span-3">
          <label htmlFor="resultsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
            Results per page
          </label>
          <select
            id="resultsPerPage"
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            value={resultsPerPage}
            onChange={(e) => setResultsPerPage(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Clear filters button */}
      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;