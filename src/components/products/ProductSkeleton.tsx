import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200 animate-pulse"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
      </div>
      
      {/* Buttons skeleton */}
      <div className="px-4 pb-4 flex space-x-2">
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;