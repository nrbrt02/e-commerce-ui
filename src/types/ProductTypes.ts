/**
 * Represents product dimensions
 */
export interface ProductDimensions {
  width: number;
  height: number;
  length: number;
}

/**
 * Represents a product category (equivalent to ProductCategory in your original code)
 */
export interface ProductCategory {
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

/**
 * Represents a product supplier
 */
export interface Supplier {
  id: number;
  username: string;
  email: string;
}

/**
 * Represents price range for filtering
 */
export interface PriceRange {
  min: number;
  max: number | null;
}

/**
 * Represents a product (equivalent to ApiProduct in your original code)
 */
export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice: string | null;
  costPrice?: string;
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
  supplier?: Supplier;
  categories: ProductCategory[];
}

/**
 * Represents API response structure
 */
export interface ApiResponse {
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

/**
 * Simplified Product interface for general use
 */
export interface Product {
  id?: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  quantity: number;
  lowStockThreshold?: number | null;
  weight?: number | null;
  dimensions?: { 
    length?: number; 
    width?: number; 
    height?: number; 
  } | null;
  tags?: string[];
  imageUrls?: string[];
  supplierId?: number;
  categoryIds?: number[];
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  supplier?: Supplier;
  categories?: ProductCategory[];
  status?: string;
  stock?: number;
  category?: string;
}