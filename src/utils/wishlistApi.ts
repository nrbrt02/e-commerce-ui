import { apiClient } from "./apiClient";
import { AUTH_TOKEN_KEY } from "../constants/auth-constants";
import { 
  WishlistCreateData,
  WishlistUpdateData,
  WishlistItemCreateData,
  WishlistItemUpdateData,
  WishlistItemMoveData,
  WishlistResponse,
  WishlistsResponse,
  WishlistItemResponse
} from "../types/wishlist.types";

// Wishlist API service
const wishlistApi = {
  // Check authentication before making any request
  _checkAuth: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      console.error("No authentication token found for wishlist operation");
      throw new Error("You must be logged in to manage your wishlist");
    }
    return token;
  },
  
  // Get all wishlists for the authenticated customer
  getWishlists: async (): Promise<WishlistsResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log("Fetching all wishlists");
      const response = await apiClient.get("/wishlists");
      console.log("Get wishlists response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      throw error;
    }
  },

  // Get a single wishlist by ID
  getWishlistById: async (
    id: number,
    options?: any
  ): Promise<WishlistResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log("Fetching wishlist by ID:", id);
      const response = await apiClient.get(`/wishlists/${id}`, options);
      console.log("Get wishlist response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching wishlist ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new wishlist
  createWishlist: async (
    data: WishlistCreateData
  ): Promise<WishlistResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log("Creating wishlist with data:", data);
      const response = await apiClient.post("/wishlists", data);
      console.log("Create wishlist response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating wishlist:", error);
      throw error;
    }
  },

  // Update a wishlist
  updateWishlist: async (
    id: number,
    data: WishlistUpdateData
  ): Promise<WishlistResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log("Updating wishlist ID:", id, "with data:", data);
      const response = await apiClient.put(`/wishlists/${id}`, data);
      console.log("Update wishlist response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating wishlist ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a wishlist
  deleteWishlist: async (
    id: number
  ): Promise<{ status: string; data: null }> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log("Deleting wishlist ID:", id);
      const response = await apiClient.delete(`/wishlists/${id}`);
      console.log("Delete wishlist response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting wishlist ID ${id}:`, error);
      throw error;
    }
  },

  // Add product to wishlist
  addProductToWishlist: async (
    wishlistId: number | string,
    data: WishlistItemCreateData
  ): Promise<WishlistItemResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log(
        "Adding product to wishlist ID:",
        wishlistId,
        "with data:",
        data
      );
      const response = await apiClient.post(
        `/wishlists/${wishlistId}/items`,
        data
      );
      console.log("Add product response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding product to wishlist ID ${wishlistId}:`, error);
      throw error;
    }
  },

  // Remove product from wishlist
  removeProductFromWishlist: async (
    wishlistId: number,
    itemId: number
  ): Promise<{ status: string; data: null }> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log("Removing item ID:", itemId, "from wishlist ID:", wishlistId);
      const response = await apiClient.delete(
        `/wishlists/${wishlistId}/items/${itemId}`
      );
      console.log("Remove product response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error removing item ID ${itemId} from wishlist ID ${wishlistId}:`, error);
      throw error;
    }
  },

  // Update wishlist item notes
  updateWishlistItemNotes: async (
    wishlistId: number,
    itemId: number,
    data: WishlistItemUpdateData
  ): Promise<WishlistItemResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log(
        "Updating item ID:",
        itemId,
        "in wishlist ID:",
        wishlistId,
        "with data:",
        data
      );
      const response = await apiClient.put(
        `/wishlists/${wishlistId}/items/${itemId}`,
        data
      );
      console.log("Update wishlist item response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating item ID ${itemId} in wishlist ID ${wishlistId}:`, error);
      throw error;
    }
  },

  // Move product to another wishlist
  moveProductToAnotherWishlist: async (
    wishlistId: number,
    itemId: number,
    data: WishlistItemMoveData
  ): Promise<WishlistItemResponse> => {
    try {
      // Check auth first
      wishlistApi._checkAuth();
      
      console.log(
        "Moving item ID:",
        itemId,
        "from wishlist ID:",
        wishlistId,
        "to wishlist ID:",
        data.targetWishlistId
      );
      const response = await apiClient.post(
        `/wishlists/${wishlistId}/items/${itemId}/move`,
        data
      );
      console.log("Move product response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error moving item ID ${itemId} from wishlist ID ${wishlistId}:`, error);
      throw error;
    }
  },
};

export default wishlistApi;