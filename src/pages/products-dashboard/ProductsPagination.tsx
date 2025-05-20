interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  resultsPerPage: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ProductsPagination = ({
  currentPage,
  totalPages,
  resultsPerPage,
  totalProducts,
  onPageChange,
  onPrevious,
  onNext,
}: ProductsPaginationProps) => {
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-4 py-2 border text-sm font-medium border-gray-300 bg-white text-gray-700"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            currentPage === i
              ? "z-10 bg-sky-50 border-sky-500 text-sky-600"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            key="ellipsis2"
            className="relative inline-flex items-center px-4 py-2 border text-sm font-medium border-gray-300 bg-white text-gray-700"
          >
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 sm:px-6">
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing{" "}
        <span className="font-medium">
          {(currentPage - 1) * resultsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * resultsPerPage, totalProducts)}
        </span>{" "}
        of <span className="font-medium">{totalProducts}</span> results
      </div>

      <div className="flex justify-center">
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="sr-only">Previous</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {renderPaginationButtons()}

          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="sr-only">Next</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};