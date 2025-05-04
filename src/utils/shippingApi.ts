// src/utils/shippingApi.ts

import { apiClient } from './apiClient';
import { DeliveryOption } from '../context/CheckoutContenxt';

// Address interface for validation
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone: string;
}

// Validation result interface
export interface AddressValidationResult {
  valid: boolean;
  message?: string;
  suggestions?: Partial<ShippingAddress>[];
}

export const shippingApi = {
  // Get shipping options for a specific location
  getShippingOptionsForLocation: async (
    country: string,
    city: string
  ): Promise<DeliveryOption[]> => {
    try {
      const response = await apiClient.get('/shipping/options', {
        params: { country, city }
      });
      
      return response.data.data || [
        // Default options if API returns no data
        {
          id: "standard",
          name: "Standard Delivery",
          description: "Delivery within 3-5 business days",
          price: 0,
          available: true,
        },
        {
          id: "express",
          name: "Express Delivery",
          description: "Delivery within 1-2 business days",
          price: 2000,
          available: true, 
        }
      ];
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      
      // Return default options if API fails
      return [
        {
          id: "standard",
          name: "Standard Delivery",
          description: "Delivery within 3-5 business days",
          price: 0,
          available: true,
        },
        {
          id: "express", 
          name: "Express Delivery",
          description: "Delivery within 1-2 business days",
          price: 2000,
          available: true,
        },
        {
          id: "same_day",
          name: "Same Day Delivery",
          description: "Delivery today (order before 2 PM)",
          price: 5000,
          available: true,
        }
      ];
    }
  },

  // Validate a shipping address
  validateAddress: async (
    address: ShippingAddress
  ): Promise<AddressValidationResult> => {
    try {
      const response = await apiClient.post('/shipping/validate-address', address);
      return response.data.data;
    } catch (error) {
      console.error('Error validating address:', error);
      // Return as valid if API fails, to avoid blocking the checkout process
      return { valid: true };
    }
  },

  // Calculate shipping costs for a specific order
  calculateShippingCost: async (
    orderId: string | number,
    shippingMethodId: string
  ): Promise<number> => {
    try {
      const response = await apiClient.get(`/shipping/calculate`, {
        params: { orderId, shippingMethodId }
      });
      return response.data.data.cost;
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      // Return default cost based on method
      switch (shippingMethodId) {
        case 'express':
          return 2000;
        case 'same_day':
          return 5000;
        case 'standard':
        default:
          return 0;
      }
    }
  },

  // Get estimated delivery dates
  getEstimatedDeliveryDates: async (
    shippingMethodId: string,
    postalCode?: string
  ): Promise<{ earliestDate: string; latestDate: string }> => {
    try {
      const response = await apiClient.get('/shipping/delivery-estimate', {
        params: { shippingMethodId, postalCode }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting delivery estimates:', error);
      
      // Return default estimates if API fails
      const today = new Date();
      const earliestDate = new Date(today);
      const latestDate = new Date(today);
      
      switch (shippingMethodId) {
        case 'express':
          earliestDate.setDate(today.getDate() + 1);
          latestDate.setDate(today.getDate() + 2);
          break;
        case 'same_day':
          // Same day delivery
          break;
        case 'standard':
        default:
          earliestDate.setDate(today.getDate() + 3);
          latestDate.setDate(today.getDate() + 5);
          break;
      }
      
      return {
        earliestDate: earliestDate.toISOString().split('T')[0],
        latestDate: latestDate.toISOString().split('T')[0]
      };
    }
  }
};

export default shippingApi;