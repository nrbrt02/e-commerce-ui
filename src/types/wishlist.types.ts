// types/wishlist.types.ts - All shared wishlist interfaces

// Common product interface for wishlist items
export interface Product {
    id: number;
    name: string;
    price: number;
    imageUrls: string[];
    slug?: string;
    inStock?: boolean;
    category?: string;
    brand?: string;
    discount?: number;
  }
  
  // API Wishlist item (what comes from the server)
  export interface ApiWishlistItem {
    id: number;
    wishlistId: number;
    productId: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    product?: Product;
  }
  
  // Frontend Wishlist item (what's used in the UI)
  export interface WishlistItem {
    id: string; // Keep as string for frontend compatibility
    name: string;
    slug: string;
    price: number;
    image: string; // Single image for display
    inStock: boolean;
    category?: string;
    brand?: string;
    discount?: number;
  }
  
  // Wishlist interface - shared between API and frontend
  export interface Wishlist {
    id: number;
    customerId: number;
    name: string;
    description?: string | null;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    items?: ApiWishlistItem[]; // Use API items format
    customer?: {
      id: number;
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  }
  
  // Wishlist Creation/Update DTOs
  export interface WishlistCreateData {
    name: string;
    description?: string;
    isPublic?: boolean;
  }
  
  export interface WishlistUpdateData {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }
  
  // Wishlist Item Creation/Update DTOs
  export interface WishlistItemCreateData {
    productId: number;
    notes?: string;
  }
  
  export interface WishlistItemUpdateData {
    notes?: string;
  }
  
  export interface WishlistItemMoveData {
    targetWishlistId: number;
  }
  
  // API Response Types
  export interface WishlistResponse {
    status: string;
    data: {
      wishlist: Wishlist;
    };
  }
  
  export interface WishlistsResponse {
    status: string;
    results: number;
    data: {
      wishlists: Wishlist[];
    };
  }
  
  export interface WishlistItemResponse {
    status: string;
    data: {
      item: ApiWishlistItem;
    };
  }
  
  // Helper functions for conversion between API and frontend formats
  export const apiToFrontendWishlistItem = (apiItem: ApiWishlistItem): WishlistItem => {
    if (!apiItem.product) {
      throw new Error("Cannot convert API wishlist item without product data");
    }
    
    return {
      id: apiItem.product.id.toString(),
      name: apiItem.product.name,
      slug: apiItem.product.slug || apiItem.product.name.toLowerCase().replace(/\s+/g, '-'),
      price: apiItem.product.price,
      image: apiItem.product.imageUrls[0] || '',
      inStock: apiItem.product.inStock !== undefined ? apiItem.product.inStock : true,
      category: apiItem.product.category,
      brand: apiItem.product.brand,
      discount: apiItem.product.discount
    };
  };
  
  export const frontendToApiWishlistItem = (
    frontendItem: WishlistItem,
    // wishlistId: number
  ): WishlistItemCreateData => {
    return {
      productId: parseInt(frontendItem.id),
      notes: ""
    };
  };