// src/utils/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'fast_shopping_token';

// Define response types
interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isStaff?: boolean;
    role?: string;
    roles?: string[];
    [key: string]: any;
  };
}

interface MessageResponse {
  message: string;
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(import.meta.env.VITE_AUTH_USER_KEY || 'fast_shopping_user');
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/account')) {
        window.location.href = '/account';
      }
    }
    return Promise.reject(error);
  }
);

// Generic API service with typed requests and responses
class ApiService {
  // Generic GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return response.data;
  }

  // Generic POST request
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return response.data;
  }

  // Generic PUT request
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return response.data;
  }
}

// Auth service for authentication related APIs
export const authAPI = {
  login: async (email: string, password: string, isStaff: boolean = false): Promise<AuthResponse> => {
    // Using a single endpoint since your backend seems to distinguish using the same endpoint
    const endpoint = '/auth/login';
    try {
      // Send the request with isStaff flag if needed
      const response = await ApiService.post<any>(endpoint, { 
        email, 
        password,
        userType: isStaff ? 'admin' : 'customer' // Add this if your backend expects it
      });
      
      // Log the response for debugging
      console.log('Login API response:', response);
      
      // Handle response format based on your backend
      // If your backend returns { status, token, data: { user } }
      if (response.status === 'success' && response.token && response.data?.user) {
        return {
          token: response.token,
          user: response.data.user
        };
      } 
      
      // If your backend returns { token, user }
      if (response.token && response.user) {
        return response;
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (data: any): Promise<AuthResponse> => {
    // Determine which endpoint to use based on isStaff flag
    const endpoint = data.isStaff ? '/auth/register' : '/auth/customer/register';
    
    // Prepare registration data
    let registrationData;
    
    if (data.isStaff) {
      // For supplier registration, include roleName
      registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        roleName: "supplier" // Set roleName to supplier for staff users
      };
    } else {
      // For customer registration, exclude roleName
      registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      };
    }
    
    // Send the registration request
    return ApiService.post<AuthResponse>(endpoint, registrationData);
  },
  
  forgotPassword: async (email: string, isStaff: boolean = false): Promise<MessageResponse> => {
    const endpoint = isStaff ? '/auth/staff/forgot-password' : '/auth/forgot-password';
    return ApiService.post<MessageResponse>(endpoint, { email });
  },
  
  resetPassword: async (token: string, password: string): Promise<MessageResponse> => {
    return ApiService.post<MessageResponse>('/auth/reset-password', { token, password });
  },
  
  updatePassword: async (currentPassword: string, newPassword: string): Promise<MessageResponse> => {
    return ApiService.post<MessageResponse>('/auth/update-password', { 
      currentPassword, 
      newPassword 
    });
  },
  
  verifyEmail: async (token: string): Promise<MessageResponse> => {
    return ApiService.post<MessageResponse>('/auth/verify-email', { token });
  },
  
  refreshToken: async (): Promise<{ token: string }> => {
    return ApiService.post<{ token: string }>('/auth/refresh-token');
  },
};

// Customer service for customer profile related APIs
export const customerAPI = {
  getProfile: async () => {
    return ApiService.get<any>('/customers/profile');
  },
  
  updateProfile: async (data: any) => {
    return ApiService.put<any>('/customers/profile', data);
  },
  
  getOrders: async (page: number = 1, limit: number = 10) => {
    return ApiService.get<any>(`/customers/orders?page=${page}&limit=${limit}`);
  },
  
  getOrderDetails: async (orderId: string) => {
    return ApiService.get<any>(`/customers/orders/${orderId}`);
  },
};

// Admin service for admin-specific APIs
export const adminAPI = {
  getDashboardStats: async () => {
    return ApiService.get<any>('/admin/dashboard/stats');
  },
  
  getUsers: async (page: number = 1, limit: number = 10) => {
    return ApiService.get<any>(`/admin/users?page=${page}&limit=${limit}`);
  },
  
  getUserDetails: async (userId: string) => {
    return ApiService.get<any>(`/admin/users/${userId}`);
  },
  
  updateUser: async (userId: string, data: any) => {
    return ApiService.put<any>(`/admin/users/${userId}`, data);
  },
  
  deleteUser: async (userId: string) => {
    return ApiService.delete<any>(`/admin/users/${userId}`);
  },
};

// Product service for product-related APIs
export const productAPI = {
  getProducts: async (page: number = 1, limit: number = 10, filters?: any) => {
    let url = `/products?page=${page}&limit=${limit}`;
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      if (queryParams.toString()) {
        url += `&${queryParams.toString()}`;
      }
    }
    return ApiService.get<any>(url);
  },
  
  getProductDetails: async (productId: string) => {
    return ApiService.get<any>(`/products/${productId}`);
  },
  
  createProduct: async (data: any) => {
    return ApiService.post<any>('/admin/products', data);
  },
  
  updateProduct: async (productId: string, data: any) => {
    return ApiService.put<any>(`/admin/products/${productId}`, data);
  },
  
  deleteProduct: async (productId: string) => {
    return ApiService.delete<any>(`/admin/products/${productId}`);
  },
};

// Order service for order-related APIs
export const orderAPI = {
  getOrders: async (page: number = 1, limit: number = 10, filters?: any) => {
    let url = `/admin/orders?page=${page}&limit=${limit}`;
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      if (queryParams.toString()) {
        url += `&${queryParams.toString()}`;
      }
    }
    return ApiService.get<any>(url);
  },
  
  getOrderDetails: async (orderId: string) => {
    return ApiService.get<any>(`/admin/orders/${orderId}`);
  },
  
  updateOrderStatus: async (orderId: string, status: string) => {
    return ApiService.patch<any>(`/admin/orders/${orderId}/status`, { status });
  },
};

export default ApiService;