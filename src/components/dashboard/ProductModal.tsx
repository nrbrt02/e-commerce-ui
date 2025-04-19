import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Category {
  id: number;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  productData?: Product | null;
  onProductSaved: (savedProduct: Product) => void;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  quantity: number;
  lowStockThreshold?: number | null;
  weight?: number | null;
  dimensions?: { length?: number; width?: number; height?: number } | null;
  tags?: string[] | null;
  imageUrls?: string[] | null;
  supplierId?: number;
  categoryIds?: number[];
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  mode,
  productData,
  onProductSaved
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    shortDescription: '',
    sku: '',
    barcode: '',
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
    supplierId: user?.id ? Number(user.id) : undefined
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  // Determine user role for conditional rendering
  const userRole = user?.role || "customer";
  const isAdmin = userRole === "admin";
  
  // Fill form when editing an existing product
  useEffect(() => {
    if (mode === 'edit' && productData) {
      setFormData({
        ...productData,
        categoryIds: productData.categoryIds || [],
        tags: productData.tags || [],
        imageUrls: productData.imageUrls || []
      });
    } else {
      // For create mode, reset the form
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        sku: '',
        barcode: '',
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
        supplierId: user?.id ? Number(user.id) : undefined
      });
    }
  }, [mode, productData, user?.id]);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAvailableCategories(response.data.data.categories || []);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };
    
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  
  // Handle form input changes (keep existing handler)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else if (name === 'price' || name === 'compareAtPrice' || name === 'costPrice' || 
               name === 'quantity' || name === 'lowStockThreshold' || name === 'weight') {
      // Handle numeric inputs
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Handle category selection (keep existing handler)
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
    setFormData({ ...formData, categoryIds: selectedOptions });
  };
  
  // Handle dimensions changes (keep existing handler)
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const dimensionKey = name.split('.')[1];
    const dimensionValue = parseFloat(value) || 0;
    
    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [dimensionKey]: dimensionValue
      }
    });
  };
  
  // Add a tag (keep existing handler)
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  // Remove a tag (keep existing handler)
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };
  
  // Add an image URL (keep existing handler)
  const handleAddImageUrl = () => {
    if (imageUrlInput.trim() && !formData.imageUrls?.includes(imageUrlInput.trim())) {
      setFormData({
        ...formData,
        imageUrls: [...(formData.imageUrls || []), imageUrlInput.trim()]
      });
      setImageUrlInput('');
    }
  };
  
  // Remove an image URL (keep existing handler)
  const handleRemoveImageUrl = (urlToRemove: string) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls?.filter(url => url !== urlToRemove) || []
    });
  };
  
  // Submit the form - UPDATED to match backend model
  // Submit the form - UPDATED to remove supplierId from payload
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Prepare the product data for submission
    const productPayload = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription,
      sku: formData.sku,
      barcode: formData.barcode,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      costPrice: formData.costPrice,
      isPublished: formData.isPublished,
      isFeatured: formData.isFeatured,
      isDigital: formData.isDigital,
      quantity: formData.quantity,
      lowStockThreshold: formData.lowStockThreshold,
      weight: formData.weight,
      dimensions: formData.dimensions,
      tags: formData.tags,
      categoryIds: formData.categoryIds,
      images: formData.imageUrls?.map(url => ({ url }))
      // Removed: supplierId - let backend handle this
    };

    if (mode === 'create') {
      await axios.post(`${API_BASE_URL}/products`, productPayload, { headers });
    } else {
      if (!formData.id) throw new Error('Product ID required for update');
      await axios.put(`${API_BASE_URL}/products/${formData.id}`, productPayload, { headers });
    }
    
    onProductSaved();
    onClose();
  } catch (err: any) {
    setError(err.response?.data?.message || err.message || 'Failed to save product');
  } finally {
    setIsLoading(false);
  }
};
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {mode === 'create' ? 'Add New Product' : 'Edit Product'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill out the form below to {mode === 'create' ? 'create a new' : 'update the'} product.
                </p>
              </div>
              
              {/* Error alert */}
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information Section */}
                <div className="md:col-span-2">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Basic Information</h4>
                </div>
                
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Short Description */}
                <div className="md:col-span-2">
                  <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    id="shortDescription"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.shortDescription}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Full Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Categories */}
                <div className="md:col-span-2">
                  <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <select
                    name="categories"
                    id="categories"
                    multiple
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.categoryIds?.map(id => id.toString())}
                    onChange={handleCategoryChange}
                  >
                    {availableCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple categories</p>
                </div>
                
                {/* Inventory Section */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Inventory</h4>
                </div>
                
                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    id="sku"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Barcode */}
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                    Barcode
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    id="barcode"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.barcode}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Low Stock Threshold */}
                <div>
                  <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    id="lowStockThreshold"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.lowStockThreshold || ''}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Pricing Section */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Pricing</h4>
                </div>
                
                {/* Regular Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Regular Price *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Compare At Price */}
                <div>
                  <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
                    Compare At Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="compareAtPrice"
                      id="compareAtPrice"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      value={formData.compareAtPrice || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Cost Price */}
                <div>
                  <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">
                    Cost Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="costPrice"
                      id="costPrice"
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      value={formData.costPrice || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                {/* Product Type */}
                <div>
                  <fieldset className="mt-4">
                    <legend className="text-sm font-medium text-gray-700">Product Type</legend>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="isDigital"
                          name="isDigital"
                          type="checkbox"
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                          checked={formData.isDigital}
                          onChange={handleChange}
                        />
                        <label htmlFor="isDigital" className="ml-3 text-sm text-gray-700">
                          Digital Product
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                {/* Product Options Section */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Product Options</h4>
                </div>
                
                {/* Weight */}
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={formData.weight || ''}
                    onChange={handleChange}
                  />
                </div>
                
                {/* Dimensions */}
                <div className="md:col-span-2 grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="dimensions.length" className="block text-sm font-medium text-gray-700">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      name="dimensions.length"
                      id="dimensions.length"
                      min="0"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      value={formData.dimensions?.length || ''}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="dimensions.width" className="block text-sm font-medium text-gray-700">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      name="dimensions.width"
                      id="dimensions.width"
                      min="0"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      value={formData.dimensions?.width || ''}
                      onChange={handleDimensionChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="dimensions.height" className="block text-sm font-medium text-gray-700">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="dimensions.height"
                      id="dimensions.height"
                      min="0"
                      step="0.1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      value={formData.dimensions?.height || ''}
                      onChange={handleDimensionChange}
                    />
                  </div>
                </div>
                
                {/* Tags */}
                <div className="md:col-span-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      className="focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Enter a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Tag list */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags?.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-sky-100 text-sky-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-sky-400 hover:bg-sky-200 hover:text-sky-500 focus:outline-none focus:bg-sky-500 focus:text-white"
                        >
                          <span className="sr-only">Remove tag {tag}</span>
                          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Image URLs */}
                <div className="md:col-span-2">
                  <label htmlFor="imageUrls" className="block text-sm font-medium text-gray-700">
                    Image URLs
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="url"
                      name="imageUrls"
                      id="imageUrls"
                      className="focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Enter an image URL"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Image URL list */}
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.imageUrls?.map((url, index) => (
                      <div 
                        key={index} 
                        className="relative rounded-md border border-gray-300 overflow-hidden group"
                      >
                        <img 
                          src={url} 
                          alt={`Product image ${index + 1}`} 
                          className="h-24 w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(url)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white bg-opacity-75 inline-flex items-center justify-center text-red-500 hover:bg-red-100 focus:outline-none"
                        >
                          <span className="sr-only">Remove image</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="px-2 py-1 text-xs truncate">{url.split('/').pop()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Visibility Section */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Visibility</h4>
                </div>
                
                {/* Published Status */}
                <div>
                  <div className="flex items-center">
                    <input
                      id="isPublished"
                      name="isPublished"
                      type="checkbox"
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                      checked={formData.isPublished}
                      onChange={handleChange}
                    />
                    <label htmlFor="isPublished" className="ml-3 text-sm text-gray-700">
                      Published
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Make this product visible to customers
                  </p>
                </div>
                
                {/* Featured Status */}
                <div>
                  <div className="flex items-center">
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                    />
                    <label htmlFor="isFeatured" className="ml-3 text-sm text-gray-700">
                      Featured
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Display this product in featured sections
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form actions */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  mode === 'create' ? 'Create Product' : 'Save Changes'
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