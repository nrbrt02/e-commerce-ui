import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import ProductModal from "./ProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import { showToast } from "../../components/ui/ToastProvider";
import { Product } from "../../types/ProductTypes";
import { ProductsHeader } from "./ProductsHeader";
import { ErrorAlert } from "./ErrorAlert";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsTable } from "./ProductsTable";
import { ProductsTableLoading } from "./ProductsTableLoading";
import { ProductsEmptyState } from "./ProductsEmptyState";
import { ProductsPagination } from "./ProductsPagination";
import { AUTH_TOKEN_KEY } from "../../constants/auth-constants";

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
  // const isSuperAdmin = !isAdmin && !isManager && hasRole("superadmin");
  const isSupplier = !isAdmin && !isManager && hasRole("supplier");

  // Fetch products data
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/products`;
      
      // If user is a supplier, fetch their specific products
      if (isSupplier && user?.id) {
        url = `${API_BASE_URL}/suppliers/${user.id}/products`;
      } else if (isAdmin || hasRole('superadmin')) {
        // Use the admin endpoint for administrators and superadmins
        url = `${API_BASE_URL}/products/admin/all`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        params: {
          search: searchTerm,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          page: currentPage,
          limit: resultsPerPage,
        },
      });

      // Handle different response structures
      const productsData = response.data.data?.products || response.data.products || [];
      const paginationData = response.data.pagination || response.data;

      const fetchedProducts = productsData.map((product: any) => ({
        ...product,
        status: getProductStatus(product),
        category:
          product.categories?.length > 0
            ? product.categories[0].name
            : "Uncategorized",
        stock: product.quantity,
      }));

      setProducts(fetchedProducts);
      setTotalProducts(paginationData.totalProducts || paginationData.total || 0);
      setTotalPages(paginationData.totalPages || Math.ceil((paginationData.total || 0) / resultsPerPage));

      const uniqueCategories = Array.from(
        new Map(
          productsData
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
      showToast.error(err.response?.data?.message || "Failed to load products");
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
      await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });
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

      await axios.put(`${API_BASE_URL}/products/${product.id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          'X-User-Role': user?.role || user?.primaryRole,
        },
      });
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

      await axios.put(`${API_BASE_URL}/products/${product.id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          'X-User-Role': user?.role || user?.primaryRole,
        },
      });
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

  // Parse image URL safely
  const parseImageUrl = (imgUrl: string) => {
    try {
      if (typeof imgUrl === "string") {
        if (imgUrl.startsWith("http")) return imgUrl;
        const parsed = JSON.parse(imgUrl);
        return parsed.url || "";
      }
      return "";
    } catch (error) {
      return imgUrl;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <ProductsHeader
        isSupplier={isSupplier}
        isRefreshing={isRefreshing}
        onRefresh={refreshProducts}
        onCreate={openCreateModal}
      />

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <ProductsFilters
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        resultsPerPage={resultsPerPage}
        categories={categories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onResultsPerPageChange={setResultsPerPage}
        onClearFilters={handleClearFilters}
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <ProductsTableLoading />
        ) : (
          <>
            {products.length > 0 ? (
              <>
                <ProductsTable
                  products={products}
                  isLoading={isLoading}
                  onView={openDetailsModal}
                  onEdit={openEditModal}
                  onDelete={handleDeleteProduct}
                  onTogglePublish={togglePublishStatus}
                  onToggleFeatured={toggleFeaturedStatus}
                  getStatusBadgeClass={getStatusBadgeClass}
                  formatPrice={formatPrice}
                  parseImageUrl={parseImageUrl}
                />
                <ProductsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  resultsPerPage={resultsPerPage}
                  totalProducts={totalProducts}
                  onPageChange={setCurrentPage}
                  onPrevious={handlePreviousPage}
                  onNext={handleNextPage}
                />
              </>
            ) : (
              <ProductsEmptyState
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                isAdmin={isAdmin}
                isManager={isManager}
                onCreate={openCreateModal}
              />
            )}
          </>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        productData={currentProduct}
        onProductSaved={handleProductSaved}
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        product={currentProduct}
      />
    </div>
  );
};

export default Products;