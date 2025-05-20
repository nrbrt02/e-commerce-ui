import React, { useEffect } from "react";
import { Product } from "../../types/ProductTypes";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) return "Not set";
    const priceValue = typeof price === "string" ? parseFloat(price) : price;
    return priceValue.toLocaleString("en-US", {
      style: "currency",
      currency: "RWF",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = () => {
    if (product.quantity <= 0) return "Out of Stock";
    if (
      product.lowStockThreshold &&
      product.quantity <= product.lowStockThreshold
    )
      return "Low Stock";
    return "In Stock";
  };

  const getStatusBadgeClass = () => {
    const status = getStatus();
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

  // Function to safely parse image URLs
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

  // Log image URLs for debugging
  useEffect(() => {
    if (product && product.imageUrls && product.imageUrls.length > 0) {
      console.log("Product images:", product.imageUrls);
      console.log("Parsed first image:", parseImageUrl(product.imageUrls[0]));
    }
  }, [product]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="product-details-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          ></div>
        </div>

        {/* This element centers the modal contents */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-5">
                  <h3
                    className="text-xl leading-6 font-medium text-gray-900"
                    id="modal-headline"
                  >
                    {product.name}
                  </h3>
                  <button
                    onClick={onClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    aria-label="Close"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Product Images */}
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Product Images
                    </h4>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <div className="relative">
                        {/* Main Image */}
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-2">
                          <img
                            src={parseImageUrl(product.imageUrls[0])}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/300?text=No+Image";
                            }}
                          />
                        </div>

                        {/* Thumbnail Row */}
                        {product.imageUrls.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {product.imageUrls.map((img, index) => (
                              <div
                                key={index}
                                className="aspect-square overflow-hidden rounded-md bg-gray-100"
                              >
                                <img
                                  src={parseImageUrl(img)}
                                  alt={`Product ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/150?text=Error";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          No images available
                        </p>
                      </div>
                    )}

                    {/* Product Status Section */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Product Status
                        </h4>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass()}`}
                        >
                          {getStatus()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-500">Published</span>
                          <span className="font-medium">
                            {product.isPublished ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500">Featured</span>
                          <span className="font-medium">
                            {product.isFeatured ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500">Digital Product</span>
                          <span className="font-medium">
                            {product.isDigital ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500">Last Updated</span>
                          <span className="font-medium">
                            {product.updatedAt
                              ? formatDate(product.updatedAt).split(",")[0]
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Basic Information
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {product.shortDescription && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">
                                Short Description
                              </h5>
                              <p className="text-sm text-gray-900">
                                {product.shortDescription}
                              </p>
                            </div>
                          )}

                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Full Description
                            </h5>
                            <p className="text-sm text-gray-900 whitespace-pre-line">
                              {product.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Product Identifiers */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Product Identifiers
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              SKU
                            </h5>
                            <p className="text-sm text-gray-900 font-mono">
                              {product.sku}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Barcode
                            </h5>
                            <p className="text-sm text-gray-900 font-mono">
                              {product.barcode || "N/A"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Categories
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.categories &&
                              product.categories.length > 0 ? (
                                product.categories.map((category) => (
                                  <span
                                    key={category.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {category.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No categories assigned
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Tags
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.tags && product.tags.length > 0 ? (
                                product.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No tags
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Inventory */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Pricing & Inventory
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Price
                            </h5>
                            <p className="text-sm text-gray-900 font-medium">
                              {product.price !== undefined
                                ? formatPrice(product.price)
                                : "Not set"}
                              {product.compareAtPrice && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  {formatPrice(product.compareAtPrice)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Cost Price
                            </h5>
                            <p className="text-sm text-gray-900">
                              {formatPrice(product.costPrice) || "Not set"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Stock Quantity
                            </h5>
                            <p className="text-sm text-gray-900">
                              {product.quantity}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Low Stock Threshold
                            </h5>
                            <p className="text-sm text-gray-900">
                              {product.lowStockThreshold || "Not set"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Weight
                            </h5>
                            <p className="text-sm text-gray-900">
                              {product.weight ? `${product.weight} g` : "N/A"}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Dimensions (L × W × H)
                            </h5>
                            <p className="text-sm text-gray-900">
                              {product.dimensions
                                ? `${product.dimensions.length || 0} × ${
                                    product.dimensions.width || 0
                                  } × ${product.dimensions.height || 0} cm`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Supplier Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Supplier Information
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex flex-col">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Supplier
                            </h5>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {product.supplier?.username || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.supplier?.email || ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Timestamps
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Created At
                            </h5>
                            <p className="text-sm text-gray-900">
                              {formatDate(product.createdAt)}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">
                              Updated At
                            </h5>
                            <p className="text-sm text-gray-900">
                              {formatDate(product.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
