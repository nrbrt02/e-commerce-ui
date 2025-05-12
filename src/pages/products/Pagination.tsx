import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      <button
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1;
        // Show first, last, current, and 1 page on each side of current
        const showPage = pageNumber === 1 || 
                        pageNumber === totalPages || 
                        Math.abs(pageNumber - currentPage) <= 1;
        
        // Show ellipsis for skipped pages
        if (!showPage) {
          if (pageNumber === 2 || pageNumber === totalPages - 1) {
            return (
              <span key={pageNumber} className="px-3 py-2 text-gray-500">...</span>
            );
          }
          return null;
        }
        
        return (
          <button
            key={pageNumber}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === pageNumber
                ? 'bg-sky-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        );
      })}
      
      <button
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;