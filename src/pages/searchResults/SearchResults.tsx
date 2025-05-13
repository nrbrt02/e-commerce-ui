// src/pages/SearchResults.tsx
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import ProductCard from '../../components/products/ProductCard';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const { 
    query, 
    setQuery, 
    results, 
    loading, 
    error, 
    pagination, 
    performSearch,
    searchInCategory
  } = useSearch();

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('query');
    const categoryIdParam = params.get('categoryId');
    
    if (queryParam) {
      setQuery(queryParam);
      
      if (categoryIdParam) {
        searchInCategory(parseInt(categoryIdParam), queryParam);
      } else {
        performSearch(queryParam);
      }
    }
  }, [location.search, setQuery, performSearch, searchInCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {results.length > 0 ? (
            <>
              Search Results for "{query}"
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination?.totalProducts || 0} {pagination?.totalProducts === 1 ? 'product' : 'products'})
              </span>
            </>
          ) : (
            <>Search Results</>
          )}
        </h1>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
            <i className="fas fa-search text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            We couldn't find any products matching "{query}"
          </p>
          <Link
            to="/products"
            className="inline-block px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
          >
            Browse all products
          </Link>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            // Use your ProductCard component instead of the custom implementation
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {pagination.hasPrevPage && (
            <Link
              to={`/search?query=${query}&page=${pagination.currentPage - 1}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Previous
            </Link>
          )}
          
          {[...Array(pagination.totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Link
                key={pageNumber}
                to={`/search?query=${query}&page=${pageNumber}`}
                className={`px-4 py-2 rounded-md transition-colors ${
                  pageNumber === pagination.currentPage
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pageNumber}
              </Link>
            );
          })}
          
          {pagination.hasNextPage && (
            <Link
              to={`/search?query=${query}&page=${pagination.currentPage + 1}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;