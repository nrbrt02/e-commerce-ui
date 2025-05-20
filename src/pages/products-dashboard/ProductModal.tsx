import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Product } from '../../types/ProductTypes';
import { AUTH_TOKEN_KEY } from "../../constants/auth-constants";
import { toast } from "react-toastify";
// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Category {
  id: number;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  productData?: Product | null;
  onProductSaved: (savedProduct: Product) => void;
}


const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  mode,
  productData,
  onProductSaved,
}) => {
  const { user } = useAuth();
  const isSupplier = user?.primaryRole === 'supplier' || user?.role === 'supplier';
  const [formData, setFormData] = useState<Product>({
    name: "",
    description: "",
    shortDescription: "",
    sku: "",
    barcode: "",
    price: 0,
    compareAtPrice: null,
    costPrice: null,
    isPublished: false,
    isFeatured: false,
    isDigital: false,
    quantity: 0,
    lowStockThreshold: null,
    weight: null,
    dimensions: null,
    tags: [],
    imageUrls: [],
    categoryIds: [],
    supplierId: user?.id ? Number(user.id) : undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [tagInput, setTagInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "basic" | "inventory" | "media" | "advanced"
  >("basic");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // const isAdmin = user?.primaryRole === 'admin' || user?.primaryRole === 'superadmin';
  // const isSupplier = user?.primaryRole === 'supplier';

  const isStaff = user?.isStaff;

  // Fill form when editing an existing product
  useEffect(() => {
    if (mode === "edit" && productData) {
      // Extract category IDs from the product data
      const categoryIds = productData.categories?.map(cat => cat.id) || [];
      
      setFormData({
        ...productData,
        categoryIds: categoryIds,
        tags: productData.tags || [],
        imageUrls: productData.imageUrls || [],
      });
    } else {
      // For create mode, reset the form
      setFormData({
        name: "",
        description: "",
        shortDescription: "",
        sku: "",
        barcode: "",
        price: 0,
        compareAtPrice: null,
        costPrice: null,
        isPublished: false,
        isFeatured: false,
        isDigital: false,
        quantity: 0,
        lowStockThreshold: null,
        weight: null,
        dimensions: null,
        tags: [],
        imageUrls: [],
        categoryIds: [],
        supplierId: user?.id ? Number(user.id) : undefined,
      });
    }

    // Reset form state
    setTagInput("");
    setImageUrlInput("");
    setActiveTab("basic");
    setFormErrors({});
  }, [mode, productData, user?.id, isOpen]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
          },
        });
        setAvailableCategories(response.data.data.categories || []);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const parseImageUrl = (imgUrl: string) => {
    try {
      if (typeof imgUrl === "string") {
        // If it's already a valid URL, return it
        if (imgUrl.startsWith("http")) return imgUrl;

        // Try to parse it as JSON
        const parsed = JSON.parse(imgUrl);
        if (parsed.url) {
          // If the url itself is a JSON string, parse it again
          try {
            const innerParsed = JSON.parse(parsed.url);
            return innerParsed.url || parsed.url;
          } catch {
            return parsed.url;
          }
        }
        return "";
      }
      return "";
    } catch (error) {
      // If parsing fails, return the original string
      return imgUrl;
    }
  };

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";

    // Number validations
    if (Number(formData.price) < 0) errors.price = "Price cannot be negative";
    if (formData.quantity < 0) errors.quantity = "Quantity cannot be negative";

    // Use type guard to avoid TypeScript error
    if (
      formData.lowStockThreshold !== null &&
      formData.lowStockThreshold !== undefined &&
      formData.lowStockThreshold < 0
    ) {
      errors.lowStockThreshold = "Threshold cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Clear the specific error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else if (
      name === "price" ||
      name === "compareAtPrice" ||
      name === "costPrice" ||
      name === "quantity" ||
      name === "lowStockThreshold" ||
      name === "weight"
    ) {
      // Handle numeric inputs - allow empty string for optional fields
      const numValue = value === "" ? null : parseFloat(value) || 0;
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value, 10)
    );
    setFormData({ ...formData, categoryIds: selectedOptions });
  };

  // Handle dimensions changes
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const dimensionKey = name.split(".")[1] as "length" | "width" | "height";

    // Allow empty values for dimensions
    const dimensionValue = value === "" ? undefined : parseFloat(value) || 0;

    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [dimensionKey]: dimensionValue,
      },
    });
  };

  // Add a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  // Add an image URL
  const handleAddImageUrl = () => {
    if (
      imageUrlInput.trim() &&
      !formData.imageUrls?.includes(imageUrlInput.trim())
    ) {
      // Format the URL as a JSON string with url property
      const formattedUrl = JSON.stringify({ url: imageUrlInput.trim() });

      setFormData({
        ...formData,
        imageUrls: [...(formData.imageUrls || []), formattedUrl],
      });
      setImageUrlInput("");
    }
  };

  // Remove an image URL
  const handleRemoveImageUrl = (urlToRemove: string) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls?.filter((url) => url !== urlToRemove) || [],
    });
  };

  // Generate a random SKU
  const generateRandomSku = () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sku = `PROD-${randomPart}`;
    setFormData({
      ...formData,
      sku,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const productData = {
        ...formData,
        // Ensure categoryIds is an array of numbers
        categoryIds: formData.categoryIds?.map(id => Number(id)) || [],
        // Send imageUrls as images to match backend expectation
        images: formData.imageUrls?.filter(url => url.trim() !== '') || [],
      };

      const headers = {
        Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        'Content-Type': 'application/json',
      };

      let response;
      if (mode === "create") {
        response = await axios.post(`${API_BASE_URL}/products`, productData, { headers });
      } else {
        response = await axios.put(
          `${API_BASE_URL}/products/${productData.id}`,
          productData,
          { headers }
        );
      }

      onProductSaved(response.data.data.product);
      onClose();
      toast.success(
        `Product ${mode === "create" ? "created" : "updated"} successfully`
      );
    } catch (err: any) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} product:`, err);
      setError(
        err.response?.data?.message ||
          `Failed to ${mode === "create" ? "create" : "update"} product`
      );
      toast.error(
        `Failed to ${mode === "create" ? "create" : "update"} product`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get error class for form inputs
  const getInputErrorClass = (fieldName: string) => {
    return formErrors[fieldName]
      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-sky-500 focus:border-sky-500";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="product-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {mode === "create" ? "Add New Product" : "Edit Product"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
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

              {/* Error alert */}
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav
                  className="-mb-px flex space-x-4 md:space-x-8"
                  aria-label="Tabs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className={`${
                      activeTab === "basic"
                        ? "border-sky-500 text-sky-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                  >
                    Basic Info
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("inventory")}
                    className={`${
                      activeTab === "inventory"
                        ? "border-sky-500 text-sky-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                  >
                    Inventory & Pricing
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className={`${
                      activeTab === "media"
                        ? "border-sky-500 text-sky-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                  >
                    Media & Tags
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("advanced")}
                    className={`${
                      activeTab === "advanced"
                        ? "border-sky-500 text-sky-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                  >
                    Advanced
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
                {/* Basic Info Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    {/* Product Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass(
                          "name"
                        )}`}
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Short Description */}
                    <div>
                      <label
                        htmlFor="shortDescription"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Short Description
                      </label>
                      <input
                        type="text"
                        name="shortDescription"
                        id="shortDescription"
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass(
                          "shortDescription"
                        )}`}
                        value={formData.shortDescription}
                        onChange={handleChange}
                        placeholder="Brief summary of the product"
                      />
                      {formErrors.shortDescription && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.shortDescription}
                        </p>
                      )}
                    </div>

                    {/* Full Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={4}
                        required
                        className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass(
                          "description"
                        )}`}
                        value={formData.description}
                        onChange={handleChange}
                      />
                      {formErrors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Categories */}
                    <div>
                      <label
                        htmlFor="categories"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Categories
                      </label>
                      <select
                        name="categories"
                        id="categories"
                        multiple
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        value={formData.categoryIds?.map((id) => id.toString())}
                        onChange={handleCategoryChange}
                        size={Math.min(5, availableCategories.length)}
                      >
                        {availableCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Hold Ctrl/Cmd to select multiple categories
                      </p>
                    </div>

                    {/* Visibility Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Visibility Settings
                      </h4>
                      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6">
                        <div className="flex items-center">
                          <input
                            id="isPublished"
                            name="isPublished"
                            type="checkbox"
                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            checked={formData.isPublished}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="isPublished"
                            className="ml-3 text-sm text-gray-700"
                          >
                            Published
                          </label>
                        </div>
                        {!isSupplier && (
                          <div className="flex items-center">
                            <input
                              id="isFeatured"
                              name="isFeatured"
                              type="checkbox"
                              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                              checked={formData.isFeatured}
                              onChange={handleChange}
                            />
                            <label
                              htmlFor="isFeatured"
                              className="ml-3 text-sm text-gray-700"
                            >
                              Featured
                            </label>
                          </div>
                        )}
                        <div className="flex items-center">
                          <input
                            id="isDigital"
                            name="isDigital"
                            type="checkbox"
                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            checked={formData.isDigital}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="isDigital"
                            className="ml-3 text-sm text-gray-700"
                          >
                            Digital Product
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory & Pricing Tab */}
                {activeTab === "inventory" && (
                  <div className="space-y-4">
                    {/* SKU & Barcode Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="sku"
                          className="block text-sm font-medium text-gray-700"
                        >
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="sku"
                            id="sku"
                            required
                            className={`flex-1 block w-full rounded-l-md sm:text-sm ${getInputErrorClass(
                              "sku"
                            )}`}
                            value={formData.sku}
                            onChange={handleChange}
                          />
                          <button
                            type="button"
                            onClick={generateRandomSku}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                          >
                            Generate
                          </button>
                        </div>
                        {formErrors.sku && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.sku}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="barcode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Barcode
                        </label>
                        <input
                          type="text"
                          name="barcode"
                          id="barcode"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          value={formData.barcode}
                          onChange={handleChange}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Pricing
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Regular Price */}
                        <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Regular Price{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                Rwf
                              </span>
                            </div>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              min="0"
                              step="0.01"
                              required
                              className={`mt-1 block w-full rounded-md shadow-sm py-2 pl-7 pr-3 sm:text-sm Rwf{getInputErrorClass(
                                "price"
                              )}`}
                              value={formData.price || ""}
                              onChange={handleChange}
                            />
                          </div>
                          {formErrors.price && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.price}
                            </p>
                          )}
                        </div>

                        {/* Compare At Price */}
                        <div>
                          <label
                            htmlFor="compareAtPrice"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Compare At Price
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                Rwf
                              </span>
                            </div>
                            <input
                              type="number"
                              name="compareAtPrice"
                              id="compareAtPrice"
                              min="0"
                              step="0.01"
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                              value={formData.compareAtPrice || ""}
                              onChange={handleChange}
                              placeholder="Optional"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Original price for showing discount
                          </p>
                        </div>

                        {/* Cost Price */}
                        <div>
                          <label
                            htmlFor="costPrice"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Cost Price
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">
                                Rwf
                              </span>
                            </div>
                            <input
                              type="number"
                              name="costPrice"
                              id="costPrice"
                              min="0"
                              step="0.01"
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                              value={formData.costPrice || ""}
                              onChange={handleChange}
                              placeholder="Optional"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Your purchase cost (not shown to customers)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Inventory Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Inventory
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="0"
                            required
                            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass(
                              "quantity"
                            )}`}
                            value={formData.quantity || ""}
                            onChange={handleChange}
                          />
                          {formErrors.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.quantity}
                            </p>
                          )}
                        </div>

                        {/* Low Stock Threshold */}
                        <div>
                          <label
                            htmlFor="lowStockThreshold"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Low Stock Threshold
                          </label>
                          <input
                            type="number"
                            name="lowStockThreshold"
                            id="lowStockThreshold"
                            min="0"
                            className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${getInputErrorClass(
                              "lowStockThreshold"
                            )}`}
                            value={formData.lowStockThreshold || ""}
                            onChange={handleChange}
                            placeholder="Optional"
                          />
                          {formErrors.lowStockThreshold && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.lowStockThreshold}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Inventory level that triggers low stock warning
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Shipping Information
                      </h4>

                      {/* Weight */}
                      <div className="mb-4">
                        <label
                          htmlFor="weight"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Weight (g)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          id="weight"
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          value={formData.weight || ""}
                          onChange={handleChange}
                          placeholder="Optional"
                        />
                      </div>

                      {/* Dimensions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dimensions (cm)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label
                              htmlFor="dimensions.length"
                              className="block text-xs text-gray-500"
                            >
                              Length
                            </label>
                            <input
                              type="number"
                              name="dimensions.length"
                              id="dimensions.length"
                              min="0"
                              step="0.1"
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                              value={formData.dimensions?.length || ""}
                              onChange={handleDimensionChange}
                              placeholder="L"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="dimensions.width"
                              className="block text-xs text-gray-500"
                            >
                              Width
                            </label>
                            <input
                              type="number"
                              name="dimensions.width"
                              id="dimensions.width"
                              min="0"
                              step="0.1"
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                              value={formData.dimensions?.width || ""}
                              onChange={handleDimensionChange}
                              placeholder="W"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="dimensions.height"
                              className="block text-xs text-gray-500"
                            >
                              Height
                            </label>
                            <input
                              type="number"
                              name="dimensions.height"
                              id="dimensions.height"
                              min="0"
                              step="0.1"
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                              value={formData.dimensions?.height || ""}
                              onChange={handleDimensionChange}
                              placeholder="H"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media & Tags Tab */}
                {activeTab === "media" && (
                  <div className="space-y-6">
                    {/* Image URLs */}
                    <div>
                      <label
                        htmlFor="imageUrls"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Product Images
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="url"
                          name="imageUrls"
                          id="imageUrls"
                          className="focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300"
                          placeholder="Enter an image URL"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                        >
                          Add
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Enter URLs for product images (JPEG, PNG, etc.)
                      </p>

                      {/* Image URL list */}
                      {formData.imageUrls && formData.imageUrls.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className="relative group rounded-md border border-gray-300 overflow-hidden"
                            >
                              <div className="aspect-square bg-gray-100">
                                <img
                                  src={parseImageUrl(url)}
                                  alt={`Product image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/150?text=Invalid+URL";
                                  }}
                                />
                              </div>
                              <div className="p-2 text-xs truncate bg-white border-t border-gray-200">
                                {url.split("/").pop()}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImageUrl(url)}
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white bg-opacity-75 flex items-center justify-center text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                aria-label="Remove image"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto h-12 w-12 text-gray-400"
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
                          <p className="mt-1 text-sm text-gray-500">
                            No images added yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="pt-4 border-t border-gray-200">
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Product Tags
                      </label>
                      <div className="flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="tags"
                          id="tags"
                          className="focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300"
                          placeholder="Enter a tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                        >
                          Add
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Tags help with search and categorization
                      </p>

                      {/* Tag list */}
                      {formData.tags && formData.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-sky-100 text-sky-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-sky-400 hover:bg-sky-200 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                              >
                                <span className="sr-only">
                                  Remove tag {tag}
                                </span>
                                <svg
                                  className="h-2 w-2"
                                  stroke="currentColor"
                                  fill="none"
                                  viewBox="0 0 8 8"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeWidth="1.5"
                                    d="M1 1l6 6m0-6L1 7"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-gray-500">
                          No tags added yet
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === "advanced" && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This section contains advanced settings. Only modify
                            these if you know what you're doing.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Custom Metadata Section - Placeholder for future expansion */}
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Custom Metadata
                      </h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                        <p className="text-sm text-gray-500">
                          Custom metadata fields are not available in this
                          version.
                        </p>
                      </div>
                    </div>

                    {/* SEO Settings - Placeholder for future expansion */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        SEO Settings
                      </h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                        <p className="text-sm text-gray-500">
                          SEO settings will be available in a future update.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form actions */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : mode === "create" ? (
                  "Create Product"
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
