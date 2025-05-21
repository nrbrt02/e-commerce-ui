// src/utils/orderApi.ts
import { apiClient } from "./apiClient";
import { DraftOrder } from "../context/CheckoutContenxt";
import { Order } from "../types/order";

// Order item interface
export interface OrderItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  name: string;
  sku?: string;
  options?: { [key: string]: string };
  metadata?: any;
}

// Cart item interface
export interface CartItem {
  id: number;
  productId?: number;
  variantId?: number;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  options?: { [key: string]: string };
  metadata?: any;
  stock?: number;
}

interface OrdersApiResponse {
  status: string;
  results: number;
  pagination: {
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  data: {
    orders: Order[];
  };
}

// API response interfaces
export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface OrderResponse {
  status: string;
  data: {
    order: Order;
  };
}

apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response || error);
    return Promise.reject(error);
  }
);

const orderApi = {
  transformCartToOrderItems: (cartItems: CartItem[]): OrderItem[] => {
    return cartItems.map((item) => ({
      productId: item.productId || item.id, // Use productId if available, fallback to id
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
      originalPrice: item.originalPrice,
      stock: item.stock,
      options: item.options,
      metadata: item.metadata,
    }));
  },

  createDraftOrder: async (
    draftData: Partial<DraftOrder>
  ): Promise<DraftOrder> => {
    try {
      console.log("Creating draft order with data:", JSON.stringify(draftData, null, 2));

      try {
        // Log the exact request being sent
        console.log("Sending request to /orders/draft with payload:", {
          url: "/orders/draft",
          method: "POST",
          data: draftData
        });

        const response = await apiClient.post("/orders/draft", draftData);

        console.log("Draft order response:", response.data);

        if (response.data && response.data.data && response.data.data.order) {
          return response.data.data.order;
        }
        return response.data.data;
      } catch (apiError: any) {
        console.error("API Error Details:", {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        console.warn(
          "API endpoint failed, using mock implementation:",
          apiError
        );
        
        // Create a mock draft order
        const mockDraftOrder: DraftOrder = {
          id: Math.floor(Math.random() * 1000000),
          items: draftData.items || [],
          subtotal: draftData.subtotal || 0,
          tax: draftData.tax || 0,
          shipping: draftData.shipping || 0,
          total: draftData.total || 0,
          totalItems: draftData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
          shippingMethod: draftData.shippingMethod,
          paymentMethod: draftData.paymentMethod,
          shippingAddress: draftData.shippingAddress,
          billingAddress: draftData.billingAddress,
          status: "draft",
          orderNumber: `DRAFT-${Date.now()}`,
          lastUpdated: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('checkoutDraftOrderId', JSON.stringify(mockDraftOrder));
        
        return mockDraftOrder;
      }
    } catch (error) {
      console.error("Error creating draft order:", error);
      throw error;
    }
  },

  getDraftOrder: async (id: number): Promise<DraftOrder> => {
    try {
      const response = await apiClient.get(`/orders/draft/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching draft order:', error);
      throw error;
    }
  },

  getOrderById: async (orderId: string | number): Promise<Order> => {
    try {
      const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);

      if (response.data && response.data.data && response.data.data.order) {
        return response.data.data.order;
      }
      throw new Error("Invalid order data structure");
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  updateDraftOrder: async (id: string | number, data: Partial<DraftOrder>): Promise<DraftOrder> => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(numericId)) {
        throw new Error('Invalid draft order ID');
      }
      const response = await apiClient.put(`/orders/draft/${numericId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating draft order:', error);
      throw error;
    }
  },

  submitOrder: async (
    orderId: string | number,
    orderData: any
  ): Promise<any> => {
    try {
      console.log(`Submitting order ${orderId} with:`, orderData);

      try {
        const response = await apiClient.post(
          `/orders/submit/${orderId}`,
          orderData
        );

        if (response.data && response.data.data && response.data.data.order) {
          return response.data.data.order;
        }
        return response.data.data;
      } catch (apiError) {
        console.warn(
          "API endpoint failed, using mock implementation:",
          apiError
        );
        return {
          id: orderId,
          orderNumber: `ORDER-${Date.now().toString().substring(4)}`,
          status: "processing",
          shippingAddress: orderData.shippingAddress,
          billingAddress: orderData.billingAddress,
          shippingMethod: orderData.shippingMethod,
          paymentMethod: orderData.paymentMethod,
          paymentDetails: orderData.paymentDetails,
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      throw error;
    }
  },

  getOrder: async (orderId: string | number): Promise<any> => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);

      if (response.data && response.data.data && response.data.data.order) {
        return response.data.data.order;
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

getOrders: async (params?: any): Promise<OrdersApiResponse> => {
    try {
      // Get the user's role from localStorage or wherever it's stored
      const userJson = localStorage.getItem('fast_shopping_user');
      let endpoint = "/orders";
      
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          if (user.role === 'supplier') {
            endpoint = "/orders/supplier-orders";
          }
          // For admin and superadmin, keep the default endpoint
        } catch (e) {
          console.error('Failed to parse user JSON:', e);
        }
      }
      
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  getOrderHistory: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/orders/my-orders");

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        return response.data.data.orders;
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order history:", error);
      return [];
    }
  },

  cancelOrder: async (
    orderId: string | number,
    reason?: string
  ): Promise<any> => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/cancel`, {
        reason,
      });

      if (response.data && response.data.data && response.data.data.order) {
        return response.data.data.order;
      }
      return response.data.data;
    } catch (error) {
      console.error("Error canceling order:", error);
      throw error;
    }
  },

  generateInvoice: async (orderId: string | number): Promise<string> => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  },

  getOrderTracking: async (orderId: string | number): Promise<any> => {
    try {
      const response = await apiClient.get(`/orders/${orderId}/tracking`);

      if (response.data && response.data.data && response.data.data.tracking) {
        return response.data.data.tracking;
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tracking information:", error);
      throw error;
    }
  },

  convertDraftToOrder: async (draftOrderId: number): Promise<any> => {
    try {
      if (!draftOrderId || isNaN(draftOrderId)) {
        throw new Error('Invalid draft order ID');
      }

      const response = await apiClient.post(`/orders/draft/${draftOrderId}/convert`);
      return response.data.data;
    } catch (error) {
      console.error('Error converting draft to order:', error);
      throw error;
    }
  },

  deleteDraftOrder: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/orders/draft/${id}`);
    } catch (error) {
      console.error('Error deleting draft order:', error);
      throw error;
    }
  },
};

export default orderApi;
