import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { useCart } from '../context/CartContext';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
// Components
import ProductCard from '../components/products/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';
import ProductSkeleton from '../components/products/ProductSkeleton';

// Types
// interface ProductImage {
//   url: string;
// }

interface ProductDimensions {
  width: number;
  height: number;
  length: number;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number | null;
  level?: number;
  path?: string;
  isActive?: boolean;
  order?: number;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital?: boolean;
  quantity: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: ProductDimensions;
  metadata?: any;
  tags: string[];
  imageUrls: string[];
  supplierId?: number;
  createdAt?: string;
  updatedAt?: string;
  supplier?: {
    id: number;
    username: string;
    email: string;
  };
  categories: ProductCategory[];
}

interface ApiResponse {
  status: string;
  results: number;
  pagination: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  data: {
    products: ApiProduct[];
  };
}

const Products: React.FC = () => {
  // State
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current category from URL params
  const currentCategorySlug = searchParams.get('category');

  // Sorting state
  const [sortOption, setSortOption] = useState<string>('featured');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 15;

  // Price range filter
  const [priceRange, setPriceRange] = useState<{ min: number, max: number | null }>({
    min: 0,
    max: null
  });

  // In stock filter
  const [showInStock, setShowInStock] = useState<boolean>(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/products`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data: ApiResponse = await response.json();
        
        // Process image URLs which are stringified JSON
        const processedProducts = data.data.products.map(product => ({
          ...product,
          imageUrls: product.imageUrls.map(img => {
            try {
              if (img.startsWith('{')) {
                const parsed = JSON.parse(img);
                return parsed.url || '';
              }
              return img;
            } catch {
              return img;
            }
          }).filter(img => img) // Filter out empty URLs
        }));
        
        setProducts(processedProducts);

        // Extract unique categories from products
        const allCategories: ProductCategory[] = [];
        const categoryIds = new Set<number>();
        
        processedProducts.forEach((product: ApiProduct) => {
          product.categories.forEach(category => {
            if (!categoryIds.has(category.id)) {
              categoryIds.add(category.id);
              allCategories.push(category);
            }
          });
        });
        
        setCategories(allCategories);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (currentCategorySlug) {
      result = result.filter(product => 
        product.categories.some(category => category.slug === currentCategorySlug)
      );
    }

    // Filter by price range
    if (priceRange.min > 0 || priceRange.max !== null) {
      result = result.filter(product => {
        const price = parseFloat(product.price);
        if (priceRange.min > 0 && price < priceRange.min) return false;
        if (priceRange.max !== null && price > priceRange.max) return false;
        return true;
      });
    }

    // Filter by stock
    if (showInStock) {
      result = result.filter(product => product.quantity > 0);
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        // Assuming newer products have higher IDs or use createdAt if available
        result.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return b.id - a.id;
        });
        break;
      case 'featured':
        // Featured products first, then sort by ID
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.id - a.id;
        });
        break;
      case 'bestselling':
        // This would need backend support for sales data
        // Fallback to featured sorting for now
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.id - a.id;
        });
        break;
      default:
        // Default to newest
        result.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, currentCategorySlug, sortOption, priceRange, showInStock]);

  // Handle category filter change
  const handleCategoryChange = (categorySlug: string | null) => {
    if (categorySlug) {
      searchParams.set('category', categorySlug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
    setCurrentPage(1);
  };

  // Handle price range filter
  const handlePriceRangeChange = (min: number, max: number | null) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
  };

  // Handle in stock filter
  const handleInStockChange = (checked: boolean) => {
    setShowInStock(checked);
    setCurrentPage(1);
  };

  // Get current products (pagination)
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Find current category for breadcrumb
  const currentCategory = currentCategorySlug 
    ? categories.find(cat => cat.slug === currentCategorySlug) 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-sky-600 transition-colors">Home</a>
        <span className="mx-2">/</span>
        <span className={currentCategory ? "text-gray-500" : "text-gray-800 font-medium"}>
          Products
        </span>
        {currentCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{currentCategory.name}</span>
          </>
        )}
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          {currentCategory ? currentCategory.name : "All Products"}
        </h1>
        
        <div className="flex items-center space-x-4">
          <p className="text-gray-600 text-sm">
            <span className="font-medium">{filteredProducts.length}</span> products
          </p>
          
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-sky-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="bestselling">Best Selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters sidebar */}
        <div className="hidden lg:block col-span-1">
          <div className="space-y-6">
            {/* Categories filter */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              <CategoryFilter 
                categories={categories}
                currentCategory={currentCategorySlug}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Price range filter */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-3">
                <button 
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 0 && priceRange.max === null ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handlePriceRangeChange(0, null)}
                >
                  All Prices
                </button>
                <button 
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 0 && priceRange.max === 10000 ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handlePriceRangeChange(0, 10000)}
                >
                  Under Rwf 10,000
                </button>
                <button 
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 10000 && priceRange.max === 50000 ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handlePriceRangeChange(10000, 50000)}
                >
                  Rwf 10,000 - Rwf 50,000
                </button>
                <button 
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 50000 && priceRange.max === 100000 ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handlePriceRangeChange(50000, 100000)}
                >
                  Rwf 50,000 - Rwf 100,000
                </button>
                <button 
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${priceRange.min === 100000 && priceRange.max === null ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => handlePriceRangeChange(100000, null)}
                >
                  Over Rwf 100,000
                </button>
              </div>

              {/* Custom price range */}
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-700 mb-2">Custom Range</p>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    onChange={e => {
                      const min = e.target.value ? parseInt(e.target.value) : 0;
                      handlePriceRangeChange(min, priceRange.max);
                    }}
                    value={priceRange.min || ''}
                  />
                  <span className="text-gray-500">-</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    min="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    onChange={e => {
                      const max = e.target.value ? parseInt(e.target.value) : null;
                      handlePriceRangeChange(priceRange.min, max);
                    }}
                    value={priceRange.max || ''}
                  />
                </div>
              </div>
            </div>

            {/* Stock filter */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  checked={showInStock}
                  onChange={e => handleInStockChange(e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
            
            {/* Clear filters button */}
            <button 
              onClick={() => {
                handleCategoryChange(null);
                handlePriceRangeChange(0, null);
                handleInStockChange(false);
                setSortOption('featured');
              }}
              className="w-full py-2 px-4 border border-sky-300 text-sky-700 rounded-md text-sm font-medium hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="mt-6 lg:mt-0 lg:col-span-3">
          {/* Mobile filters */}
          <div className="flex lg:hidden mb-4 overflow-x-auto pb-2 -mx-4 px-4 space-x-2">
            {/* Mobile category filter */}
            <div className="relative">
              <select
                value={currentCategorySlug || ''}
                onChange={e => handleCategoryChange(e.target.value || null)}
                className="block appearance-none bg-white border border-gray-300 hover:border-sky-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Mobile price filter */}
            <div className="relative">
              <select
                value={`${priceRange.min}-${priceRange.max}`}
                onChange={e => {
                  const value = e.target.value;
                  if (value === 'all') {
                    handlePriceRangeChange(0, null);
                  } else {
                    const [min, max] = value.split('-').map(v => v === 'null' ? null : parseInt(v));
                    handlePriceRangeChange(min || 0, max);
                  }
                }}
                className="block appearance-none bg-white border border-gray-300 hover:border-sky-500 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
              >
                <option value="all">All Prices</option>
                <option value="0-10000">Under Rwf 10,000</option>
                <option value="10000-50000">Rwf 10,000 - Rwf 50,000</option>
                <option value="50000-100000">Rwf 50,000 - Rwf 100,000</option>
                <option value="100000-null">Over Rwf 100,000</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Mobile in stock filter */}
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                showInStock 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
              onClick={() => handleInStockChange(!showInStock)}
            >
              In Stock
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-700">{error}</p>
              <button 
                className="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search criteria.
              </p>
              <button 
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                onClick={() => {
                  handleCategoryChange(null);
                  handlePriceRangeChange(0, null);
                  handleInStockChange(false);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-1 mt-8">
                  <button
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;