import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import ProductModal from "../components/dashboard/ProductModal";
import ProductDetailsModal from "../components/dashboard/ProductDetailsModal";
import { showToast } from "../components/ui/ToastProvider";
import { Product } from "../types/ProductTypes";
import {
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Products: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const hasRole = (roleName: string) => {
    if (user?.primaryRole === roleName) return true;

    if (user?.role === roleName) return true;

    if (user?.roles) {
      if (Array.isArray(user.roles) && typeof user.roles[0] === "string") {
        return user.roles.includes(roleName);
      }

      if (Array.isArray(user.roles) && typeof user.roles[0] === "object") {
        return user.roles.some((role: string | { name: string }) => {
          if (typeof role === "string") {
            return role === roleName;
          } else {
            return role.name === roleName;
          }
        });
      }
    }

    return false;
  };

  // Make role checks mutually exclusive
  const isAdmin = hasRole("admin");
  const isManager = !isAdmin && hasRole("manager");
  const isSuperAdmin = !isAdmin && !isManager && hasRole("superadmin");
  // const isSupplier = !isAdmin && !isManager && hasRole("supplier");

  // Fetch products data
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: {
          search: searchTerm,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          page: currentPage,
          limit: resultsPerPage,
        },
      });

      const fetchedProducts = response.data.data.products.map(
        (product: any) => ({
          ...product,
          status: getProductStatus(product),
          category:
            product.categories?.length > 0
              ? product.categories[0].name
              : "Uncategorized",
          stock: product.quantity,
          // price: typeof product.price === 'string'
          //   ? parseFloat(product.price)
          //   : product.price,
          // compareAtPrice: product.compareAtPrice
          //   ? typeof product.compareAtPrice === 'string'
          //     ? parseFloat(product.compareAtPrice)
          //     : product.compareAtPrice
          //   : null,
          // costPrice: product.costPrice
          //   ? typeof product.costPrice === 'string'
          //     ? parseFloat(product.costPrice)
          //     : product.costPrice
          //   : null,
        })
      );

      setProducts(fetchedProducts);
      setTotalProducts(response.data.pagination.totalProducts);
      setTotalPages(response.data.pagination.totalPages);

      // Extract unique categories from products
      // const allCategories = response.data.data.products.flatMap(
      //   (p: Product) => p.categories
      // );
      const uniqueCategories = Array.from(
        new Map(
          response.data.data.products
            .flatMap((p: Product) => p.categories || [])
            .map((cat: any) => [cat.id.toString(), cat])
        ).values()
      ).map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
      }));

      setCategories([
        { id: "all", name: "All Categories" },
        ...uniqueCategories,
      ]);

      setIsLoading(false);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
      setIsLoading(false);
      showToast.error("Failed to load products");
    }
  };

  // Refresh products
  const refreshProducts = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
    showToast.info("Products refreshed");
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, currentPage, resultsPerPage]);

  // Helper function to determine product status
  const getProductStatus = (product: Product): string => {
    if (product.quantity <= 0) return "Out of Stock";
    if (
      product.lowStockThreshold &&
      product.quantity <= product.lowStockThreshold
    )
      return "Low Stock";
    return "In Stock";
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: number | undefined) => {
    if (!productId) {
      showToast.error("Cannot delete product: Invalid product ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
      setProducts(products.filter((product) => product.id !== productId));
      showToast.success("Product deleted successfully");
    } catch (err: any) {
      console.error("Error deleting product:", err);
      showToast.error(
        err.response?.data?.message || "Failed to delete product"
      );
    }
  };

  // Toggle product publish status
  const togglePublishStatus = async (product: Product) => {
    try {
      const updatedProduct = {
        ...product,
        isPublished: !product.isPublished,
      };

      await axios.put(`${API_BASE_URL}/products/${product.id}`, updatedProduct);
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, isPublished: !p.isPublished } : p
        )
      );
      showToast.success(
        `Product ${
          product.isPublished ? "unpublished" : "published"
        } successfully`
      );
    } catch (err: any) {
      console.error("Error updating product:", err);
      showToast.error(
        err.response?.data?.message || "Failed to update product"
      );
    }
  };

  // Toggle product featured status
  const toggleFeaturedStatus = async (product: Product) => {
    try {
      const updatedProduct = {
        ...product,
        isFeatured: !product.isFeatured,
      };

      await axios.put(`${API_BASE_URL}/products/${product.id}`, updatedProduct);
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
        )
      );
      showToast.success(
        `Product ${product.isFeatured ? "removed from" : "marked as"} featured`
      );
    } catch (err: any) {
      console.error("Error updating product:", err);
      showToast.error(
        err.response?.data?.message || "Failed to update product"
      );
    }
  };

  // Open edit modal for a product
  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Open view details modal
  const openDetailsModal = (product: Product) => {
    setCurrentProduct(product);
    setIsDetailsModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setCurrentProduct(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format price
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return "Not set";
    const priceValue = typeof price === "string" ? parseFloat(price) : price;
    return priceValue.toLocaleString("en-US", {
      style: "currency",
      currency: "RWF",
    });
  };

  // Handle product save from modal
  const handleProductSaved = (savedProduct: Product) => {
    if (modalMode === "create") {
      setProducts([savedProduct, ...products]);
      showToast.success("Product created successfully");
    } else {
      setProducts(
        products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
      showToast.success("Product updated successfully");
    }

    // Close the modal after saving
    setIsModalOpen(false);
  };

  // Pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Clear search and filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Show at most 5 page buttons

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Add first page button if not included
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => setCurrentPage(1)}
          className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          1
        </button>
      );

      // Add ellipsis if needed
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

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
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

    // Add last page button if not included
    if (endPage < totalPages) {
      // Add ellipsis if needed
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
          onClick={() => setCurrentPage(totalPages)}
          className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Parse image URL safely
  const parseImageUrl = (imgUrl: string) => {
    try {
      if (typeof imgUrl === "string") {
        // Check if it's already a valid URL
        if (imgUrl.startsWith("http")) return imgUrl;

        // Try to parse it as JSON
        const parsed = JSON.parse(imgUrl);
        return parsed.url || "";
      }
      return "";
    } catch (error) {
      // If parsing fails, return the original string
      return imgUrl;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header with title and actions */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Products Management
          </h1>

          <div className="flex flex-col sm:flex-row gap-3">
            {(isSuperAdmin || isAdmin) && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add New Product
              </button>
            )}

            <button
              onClick={refreshProducts}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              disabled={isRefreshing}
            >
              <ArrowPathIcon
                className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Products
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                placeholder="Search by product name..."
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

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Category
            </label>
            <select
              id="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="resultsPerPage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Results per page
            </label>
            <select
              id="resultsPerPage"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
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
        {(searchTerm || selectedCategory !== "all") && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Products table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="mb-6 animate-pulse">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-1 bg-gray-100 my-4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Visibility
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            {product.imageUrls &&
                            product.imageUrls.length > 0 ? (
                              <img
                                src={parseImageUrl(product.imageUrls[0])}
                                alt={product.name}
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/150?text=No+Image";
                                }}
                              />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              SKU: {product.sku}
                            </div>
                            {/* Mobile-only status badges */}
                            <div className="sm:hidden mt-1">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                  product.status || ""
                                )}`}
                              >
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {product.category || "Uncategorized"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                        {product.compareAtPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            product.status || ""
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => togglePublishStatus(product)}
                            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                              product.isPublished ? "bg-sky-600" : "bg-gray-200"
                            }`}
                            aria-pressed={product.isPublished}
                            aria-labelledby={`product-${product.id}-published`}
                          >
                            <span
                              className="sr-only"
                              id={`product-${product.id}-published`}
                            >
                              {product.isPublished
                                ? "Published"
                                : "Unpublished"}
                            </span>
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                product.isPublished
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                          {/* {(isAdmin) && ( */}
                          <button
                            onClick={() => toggleFeaturedStatus(product)}
                            className={`text-sm ${
                              product.isFeatured
                                ? "text-yellow-500"
                                : "text-gray-400"
                            } hover:text-yellow-600 focus:outline-none`}
                            title={
                              product.isFeatured ? "Featured" : "Not Featured"
                            }
                          >
                            <StarIcon
                              className="h-5 w-5"
                              fill={
                                product.isFeatured ? "currentColor" : "none"
                              }
                            />
                          </button>
                          {/* )} */}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => openDetailsModal(product)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline flex items-center justify-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {(isAdmin || isManager) && (
                            <>
                              <button
                                onClick={() => openEditModal(product)}
                                className="text-sky-600 hover:text-sky-900 focus:outline-none focus:underline flex items-center justify-center"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900 focus:outline-none focus:underline flex items-center justify-center"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {products.length === 0 && !isLoading && (
              <div className="py-16 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-16 w-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Get started by creating your first product."}
                </p>
                {(isAdmin || isManager) && (
                  <button
                    onClick={openCreateModal}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Your First Product
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && (
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
                  onClick={handlePreviousPage}
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

                {/* Improved pagination buttons */}
                {renderPaginationButtons()}

                <button
                  onClick={handleNextPage}
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
        )}
      </div>

      {/* Product Modal Component */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        productData={currentProduct}
        onProductSaved={handleProductSaved}
      />

      {/* Product Details Modal Component */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        product={currentProduct}
      />
    </div>
  );
};

export default Products;
