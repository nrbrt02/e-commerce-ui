// src/components/reviews/ReviewList.tsx
import React from "react";
import { Review } from "../../services/reviewService";
import { formatDate } from "../../utils/formatters";
import { 
  StarIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  HandThumbUpIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
  onView: (review: Review) => void;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string) => void;
  onVoteHelpful: (reviewId: string) => void;
  onToggleApproval: (reviewId: string) => void;
  onToggleVerified: (reviewId: string) => void;
  onApprove?: (id: string) => void;
  onVerify?: (id: string) => void;
  showActions?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews = [],
  isLoading,
  onView,
  onEdit,
  onDelete,
  onVoteHelpful,
  onToggleApproval,
  onToggleVerified,
  onApprove,
  onVerify,
  showActions = true,
}) => {
  const { user } = useAuth();
  const isSupplier = user?.role === 'supplier';
console.log(isSupplier);
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You haven't written any reviews yet.
        </p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400">
            {star <= rating ? (
              <StarIcon className="h-5 w-5 fill-current" />
            ) : (
              <StarOutlineIcon className="h-5 w-5" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await onToggleApproval(reviewId);
    } catch (error) {
      console.error('Error toggling review approval:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {reviews.map((review) => {
          if (!review) return null;
          
          return (
            <div key={review.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {review.product?.name || "Unknown Product"}
                    </h3>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <h4 className="text-md font-semibold text-gray-800 mt-1">
                    {review.title || "No title"}
                  </h4>

                  <p className="mt-1 text-gray-600">{review.comment || "No comment provided"}</p>

                  <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                    <span>
                      Reviewed on {formatDate(review.createdAt)}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        Verified Purchase
                      </span>
                    )}
                    <span className="inline-flex items-center">
                      <HandThumbUpIcon className="h-4 w-4 mr-1" />
                      {review.helpfulVotes || 0} helpful
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => review && onView(review)}
                    className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>

                  {/* Approval button - available to all users */}
                  <button
                    onClick={() => handleApprove(review.id)}
                    className={`flex items-center justify-center ${
                      review.isApproved 
                        ? "text-red-600 hover:text-red-800" 
                        : "text-green-600 hover:text-green-800"
                    }`}
                  >
                    {review.isApproved ? (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </button>
                  
                  {!isSupplier && showActions && (
                    <>
                      <button
                        onClick={() => review && onEdit(review)}
                        className="text-sky-600 hover:text-sky-900 focus:outline-none focus:underline flex items-center justify-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => review?.id && onDelete(review.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:underline flex items-center justify-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                      
                      <button
                        onClick={() => review?.id && onVoteHelpful(review.id)}
                        className="text-gray-600 hover:text-gray-900 focus:outline-none focus:underline flex items-center justify-center"
                      >
                        <HandThumbUpIcon className="h-4 w-4 mr-1" />
                        Helpful
                      </button>

                      {/* Verify button - only for non-suppliers */}
                      {onVerify && (
                        <button
                          onClick={() => onVerify(review.id)}
                          className={`flex items-center justify-center ${
                            review.isVerifiedPurchase 
                              ? "text-red-600 hover:text-red-800" 
                              : "text-green-600 hover:text-green-800"
                          }`}
                        >
                          {review.isVerifiedPurchase ? (
                            <>
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;