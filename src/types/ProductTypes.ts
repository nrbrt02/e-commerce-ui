// types/ProductTypes.ts

export interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
  }
  
  export interface Supplier {
    id: number;
    username: string;
    email: string;
  }
  
  export interface Product {
    id?: number;
    name: string;
    description: string;
    shortDescription: string;
    sku: string;
    barcode: string;
    price: number | string; // Allow both number and string to accommodate different API responses
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
    
    // Additional properties from API responses
    metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    supplier?: Supplier;
    categories?: Category[];
    
    // These are computed properties
    status?: string;
    stock?: number;
    category?: string;
  }