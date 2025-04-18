import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 Unauthorized, and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark the request as retried
      originalRequest._retry = true;
      
      // Clear token and redirect to login if we get a 401
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Redirect to login (if not in tests)
      if (typeof window !== 'undefined') {
        window.location.href = '/account/login';
      }
      
      return Promise.reject(error);
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Login user
  login: async (email: string, password: string, userType: string = 'customer'): Promise<AxiosResponse> => {
    return apiClient.post('/auth/login', { email, password, userType });
  },
  
  // Register user (staff)
  registerUser: async (userData: any): Promise<AxiosResponse> => {
    return apiClient.post('/auth/register', userData);
  },
  
  // Register customer
  registerCustomer: async (userData: any): Promise<AxiosResponse> => {
    return apiClient.post('/auth/customer/register', userData);
  },
  
  // Get current user
  getCurrentUser: async (): Promise<AxiosResponse> => {
    return apiClient.get('/auth/me');
  },
  
  // Forgot password
  forgotPassword: async (email: string, userType: string = 'customer'): Promise<AxiosResponse> => {
    return apiClient.post('/auth/forgot-password', { email, userType });
  },
  
  // Reset password
  resetPassword: async (token: string, newPassword: string, userType: string = 'customer'): Promise<AxiosResponse> => {
    return apiClient.post('/auth/reset-password', { token, newPassword, userType });
  },
  
  // Update password (when logged in)
  updatePassword: async (currentPassword: string, newPassword: string): Promise<AxiosResponse> => {
    return apiClient.patch('/auth/update-password', { currentPassword, newPassword });
  },
};

// Customer API
export const customerAPI = {
  // Get customer profile
  getProfile: async (): Promise<AxiosResponse> => {
    return apiClient.get('/customers/profile');
  },
  
  // Update customer profile
  updateProfile: async (profileData: any): Promise<AxiosResponse> => {
    return apiClient.put('/customers/profile', profileData);
  },
  
  // Update customer password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<AxiosResponse> => {
    return apiClient.put('/customers/profile/password', { currentPassword, newPassword });
  },
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<AxiosResponse> => {
    return apiClient.get('/dashboard/stats');
  },
  
  // Get all users
  getUsers: async (params?: any): Promise<AxiosResponse> => {
    return apiClient.get('/users', { params });
  },
  
  // Get user by ID
  getUserById: async (id: number): Promise<AxiosResponse> => {
    return apiClient.get(`/users/${id}`);
  },
  
  // Create user
  createUser: async (userData: any): Promise<AxiosResponse> => {
    return apiClient.post('/users', userData);
  },
  
  // Update user
  updateUser: async (id: number, userData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/users/${id}`, userData);
  },
  
  // Delete user
  deleteUser: async (id: number): Promise<AxiosResponse> => {
    return apiClient.delete(`/users/${id}`);
  },
  
  // Get all customers
  getCustomers: async (params?: any): Promise<AxiosResponse> => {
    return apiClient.get('/customers', { params });
  },
  
  // Get customer by ID
  getCustomerById: async (id: number): Promise<AxiosResponse> => {
    return apiClient.get(`/customers/${id}`);
  },
  
  // Update customer
  updateCustomer: async (id: number, customerData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/customers/${id}`, customerData);
  },
  
  // Delete customer
  deleteCustomer: async (id: number): Promise<AxiosResponse> => {
    return apiClient.delete(`/customers/${id}`);
  },
};

// Products API
export const productAPI = {
  // Get all products
  getProducts: async (params?: any): Promise<AxiosResponse> => {
    return apiClient.get('/products', { params });
  },
  
  // Get product by ID
  getProductById: async (id: number): Promise<AxiosResponse> => {
    return apiClient.get(`/products/${id}`);
  },
  
  // Create product
  createProduct: async (productData: any): Promise<AxiosResponse> => {
    return apiClient.post('/products', productData);
  },
  
  // Update product
  updateProduct: async (id: number, productData: any): Promise<AxiosResponse> => {
    return apiClient.put(`/products/${id}`, productData);
  },
  
  // Delete product
  deleteProduct: async (id: number): Promise<AxiosResponse> => {
    return apiClient.delete(`/products/${id}`);
  },
};

// Orders API
export const orderAPI = {
  // Get all orders
  getOrders: async (params?: any): Promise<AxiosResponse> => {
    return apiClient.get('/orders', { params });
  },
  
  // Get order by ID
  getOrderById: async (id: number): Promise<AxiosResponse> => {
    return apiClient.get(`/orders/${id}`);
  },
  
  // Update order status
  updateOrderStatus: async (id: number, status: string): Promise<AxiosResponse> => {
    return apiClient.patch(`/orders/${id}/status`, { status });
  },
  
  // Get customer orders (for customer profile)
  getCustomerOrders: async (): Promise<AxiosResponse> => {
    return apiClient.get('/customers/profile/orders');
  },
};

export default apiClient;