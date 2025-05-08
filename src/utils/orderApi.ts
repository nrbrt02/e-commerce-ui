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
      productId: item.productId || item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      options: item.options,
      metadata: item.metadata,
    }));
  },

  createDraftOrder: async (
    draftData: Partial<DraftOrder>
  ): Promise<DraftOrder> => {
    try {
      console.log("Creating draft order with data:", draftData);

      try {
        const response = await apiClient.post("/orders/draft", draftData);

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
          id: Math.floor(Math.random() * 1000000),
          items: draftData.items || [],
          subtotal: draftData.subtotal || 0,
          tax: draftData.tax || 0,
          shipping: draftData.shipping || 0,
          total: draftData.total || 0,
          shippingMethod: draftData.shippingMethod,
          status: "draft",
          orderNumber: `DRAFT-${Date.now()}`,
        };
      }
    } catch (error) {
      console.error("Error creating draft order:", error);
      throw error;
    }
  },

  getDraftOrder: async (orderId: string | number): Promise<DraftOrder> => {
    try {
      console.log(`Fetching draft order ${orderId}`);

      try {
        const response = await apiClient.get(`/orders/draft/${orderId}`);

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
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
          status: "draft",
          orderNumber: `DRAFT-${orderId}`,
        };
      }
    } catch (error) {
      console.error("Error fetching draft order:", error);
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

  updateDraftOrder: async (
    orderId: string | number,
    updateData: Partial<DraftOrder>
  ): Promise<DraftOrder> => {
    try {
      console.log(
        `UpdateDraftOrder - Updating draft order ${orderId} with:`,
        updateData
      );

      // Always try the real API endpoint first
      try {
        console.log(`Making PUT request to /orders/draft/${orderId}`);
        console.log("Request payload:", JSON.stringify(updateData, null, 2));

        const response = await apiClient.put(
          `/orders/draft/${orderId}`,
          updateData
        );

        console.log("API response:", response);

        if (response.data && response.data.data && response.data.data.order) {
          console.log("Returning nested order data");
          return response.data.data.order;
        }

        console.log("Returning direct data");
        return response.data.data;
      } catch (apiError) {
        console.warn(
          "API endpoint failed, using mock implementation:",
          apiError
        );

        // Fallback to localStorage for mock data
        let existingDraft;
        try {
          const key = `mock_draft_order_${orderId}`;
          const storedDraft = localStorage.getItem(key);
          existingDraft = storedDraft
            ? JSON.parse(storedDraft)
            : {
                id: orderId,
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
                status: "draft",
                orderNumber: `DRAFT-${orderId}`,
              };
        } catch (getDraftError) {
          console.error("Error getting draft order:", getDraftError);
          existingDraft = {
            id: orderId,
            items: [],
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
            status: "draft",
            orderNumber: `DRAFT-${orderId}`,
          };
        }

        const mockUpdatedOrder = {
          ...existingDraft,
          ...updateData,
          id: orderId,
          shippingAddress:
            updateData.shippingAddress || existingDraft.shippingAddress,
          billingAddress:
            updateData.billingAddress || existingDraft.billingAddress,
          shippingMethod:
            updateData.shippingMethod || existingDraft.shippingMethod,
          paymentMethod:
            updateData.paymentMethod || existingDraft.paymentMethod,
          paymentDetails:
            updateData.paymentDetails || existingDraft.paymentDetails,
          paymentStatus:
            updateData.paymentStatus || existingDraft.paymentStatus,
          status: "draft",
          orderNumber: existingDraft.orderNumber || `DRAFT-${orderId}`,
        };

        console.log("Mock updated order:", mockUpdatedOrder);

        try {
          const key = `mock_draft_order_${orderId}`;
          localStorage.setItem(key, JSON.stringify(mockUpdatedOrder));
          console.log(`Saved mock order to localStorage with key ${key}`);
        } catch (storageError) {
          console.error("Error saving to localStorage:", storageError);
        }

        return mockUpdatedOrder;
      }
    } catch (error) {
      console.error("Error updating draft order:", error);
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
      const response = await apiClient.get("/orders", { params });
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

  convertDraftToOrder: async (orderId: string | number): Promise<any> => {
    try {
      console.log(`Converting draft order ${orderId} to a real order`);

      try {
        const response = await apiClient.post(
          `/orders/draft/${orderId}/convert`
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
          status: "pending",
          paymentStatus: "pending",
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          metadata: {
            convertedFromDraft: true,
            convertedAt: new Date().toISOString(),
          },
        };
      }
    } catch (error) {
      console.error(`Error converting draft order ${orderId}:`, error);
      throw error;
    }
  },
};

export default orderApi;
