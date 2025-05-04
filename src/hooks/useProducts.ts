// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';

// Types for API response
export interface ApiProductResponse {
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

export interface ProductDimensions {
  width: number;
  height: number;
  length: number;
}

export interface Supplier {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: number | null;
  level: number;
  path: string;
  isActive: boolean;
  order: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  descriptionHtml?: string; // Adding the missing property
  sku: string;
  barcode: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  quantity: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: ProductDimensions;
  metadata: any;
  tags: string[];
  imageUrls: string[];
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  categories: Category[];
  rating?: number; // Adding the missing property
  reviewCount?: number; // Adding the missing property
  brand?: Brand; // Adding brand property for the brand name reference
}

// Hook return type
interface UseProductsReturn {
  products: ApiProduct[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching products from the API
 * Using the proper API base URL from environment variables
 */
export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get API base URL from environment variables
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the correct API base URL from environment variables
      const endpoint = `${apiBaseUrl}/products`;
      console.log('Fetching products from:', endpoint);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      // Check for the expected data format based on your API response
      if (data.status === 'success' && data.data && data.data.products) {
        setProducts(data.data.products);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts
  };
};

export default useProducts;