import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ApiProduct,
  ProductCategory,
  ApiResponse,
  PriceRange,
} from "../../types/ProductTypes";
import ProductCard from "../../components/products/ProductCard";
import ProductSkeleton from "../../components/products/ProductSkeleton";
import FilterSidebar from "./FilterSidebar";
import MobileFilters from "./MobileFilters";
import Pagination from "./Pagination";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Products: React.FC = () => {
  // State
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const isFeaturedParam = searchParams.get("featured") === "true";
  // Get current category from URL params
  const currentCategorySlug = searchParams.get("category");

  // Sorting state
  const [sortOption, setSortOption] = useState<string>("featured");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 15;

  // Price range filter
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: null,
  });

  // In stock filter
  const [showInStock, setShowInStock] = useState<boolean>(false);

  // Featured filter
  const [showFeatured, setShowFeatured] = useState<boolean>(isFeaturedParam);


  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/products`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        // Process image URLs which are stringified JSON
        const processedProducts = data.data.products.map((product) => ({
          ...product,
          imageUrls: product.imageUrls
            .map((img) => {
              try {
                if (img.startsWith("{")) {
                  const parsed = JSON.parse(img);
                  return parsed.url || "";
                }
                return img;
              } catch {
                return img;
              }
            })
            .filter((img) => img), // Filter out empty URLs
        }));

        setProducts(processedProducts);

        // Extract unique categories from products
        const allCategories: ProductCategory[] = [];
        const categoryIds = new Set<number>();

        processedProducts.forEach((product: ApiProduct) => {
          product.categories.forEach((category) => {
            if (!categoryIds.has(category.id)) {
              categoryIds.add(category.id);
              allCategories.push(category);
            }
          });
        });

        setCategories(allCategories);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching products:", err);
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
      result = result.filter((product) =>
        product.categories.some(
          (category) => category.slug === currentCategorySlug
        )
      );
    }

    // Filter by price range
    if (priceRange.min > 0 || priceRange.max !== null) {
      result = result.filter((product) => {
        const price = parseFloat(product.price);
        if (priceRange.min > 0 && price < priceRange.min) return false;
        if (priceRange.max !== null && price > priceRange.max) return false;
        return true;
      });
    }

    // Filter by stock
    if (showInStock) {
      result = result.filter((product) => product.quantity > 0);
    }

    // Filter by featured
    if (showFeatured) {
      result = result.filter((product) => product.isFeatured);
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        // Assuming newer products have higher IDs or use createdAt if available
        result.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return b.id - a.id;
        });
        break;
      case "featured":
        // Featured products first, then sort by ID
        result.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.id - a.id;
        });
        break;
      case "bestselling":
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
  }, [
    products,
    currentCategorySlug,
    sortOption,
    priceRange,
    showInStock,
    showFeatured,
  ]);

  // Handle category filter change
  const handleCategoryChange = (categorySlug: string | null) => {
    if (categorySlug) {
      searchParams.set("category", categorySlug);
    } else {
      searchParams.delete("category");
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

  // Handle featured filter
  const handleFeaturedChange = (checked: boolean) => {
    setShowFeatured(checked);
    setCurrentPage(1);
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    handleCategoryChange(null);
    handlePriceRangeChange(0, null);
    handleInStockChange(false);
    handleFeaturedChange(false);
    setSortOption("featured");
  };

  // Get current products (pagination)
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Find current category for breadcrumb
  const currentCategory = currentCategorySlug
    ? categories.find((cat) => cat.slug === currentCategorySlug)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-sky-600 transition-colors">
          Home
        </a>
        <span className="mx-2">/</span>
        <span
          className={
            currentCategory ? "text-gray-500" : "text-gray-800 font-medium"
          }
        >
          Products
        </span>
        {currentCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">
              {currentCategory.name}
            </span>
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
            <span className="font-medium">{filteredProducts.length}</span>{" "}
            products
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
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters sidebar */}
        <div className="hidden lg:block col-span-1">
          <FilterSidebar
            categories={categories}
            currentCategorySlug={currentCategorySlug}
            priceRange={priceRange}
            showInStock={showInStock}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onInStockChange={handleInStockChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products grid */}
        <div className="mt-6 lg:mt-0 lg:col-span-3">
          <MobileFilters
            categories={categories}
            currentCategorySlug={currentCategorySlug}
            priceRange={priceRange}
            showInStock={showInStock}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onInStockChange={handleInStockChange}
          />

          {/* Featured filter toggle - visible on all screen sizes */}
          <div className="mb-4 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                checked={showFeatured}
                onChange={(e) => handleFeaturedChange(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">
                Show Featured Only
              </span>
            </label>
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
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search criteria.
              </p>
              <button
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
