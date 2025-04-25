import { apiClient } from './apiClient';

// Types
export interface Customer {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  addresses?: object[];
  preferences?: object;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListParams {
  search?: string;
  verified?: boolean;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerPasswordUpdate {
  password: string;
}

export interface CustomerUpdateData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isVerified?: boolean;
  isActive?: boolean;
  addresses?: object[];
  preferences?: object;
}

export interface PaginationResponse {
  totalCustomers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerListResponse {
  status: string;
  results: number;
  pagination: PaginationResponse;
  data: {
    customers: Customer[];
  };
}

export interface CustomerResponse {
  status: string;
  data: {
    customer: Customer;
  };
}

// Customer API service
const customerApi = {
  // Get all customers with pagination and filters
  getCustomers: async (params: CustomerListParams = {}): Promise<CustomerListResponse> => {
    console.log('Fetching customers with params:', params);
    const response = await apiClient.get('/customers', { params });
    console.log('Get customers response:', response.data);
    return response.data;
  },

  // Get a single customer by ID
  getCustomerById: async (id: number): Promise<CustomerResponse> => {
    console.log('Fetching customer by ID:', id);
    const response = await apiClient.get(`/customers/${id}`);
    console.log('Get customer by ID response:', response.data);
    return response.data;
  },

  // Create a new customer (admin feature)
  createCustomer: async (data: CustomerUpdateData): Promise<CustomerResponse> => {
    console.log('Creating customer with data:', { ...data });
    const response = await apiClient.post('/customers', data);
    console.log('Create customer response:', response.data);
    return response.data;
  },

  // Update a customer
  updateCustomer: async (id: number, data: CustomerUpdateData): Promise<CustomerResponse> => {
    console.log('Updating customer ID:', id, 'with data:', { ...data });
    const response = await apiClient.put(`/customers/${id}`, data);
    console.log('Update customer response:', response.data);
    return response.data;
  },

  // Update customer password (admin)
  updateCustomerPassword: async (id: number, data: CustomerPasswordUpdate): Promise<{ status: string; message: string }> => {
    console.log('Updating customer password for ID:', id);
    const response = await apiClient.put(`/customers/${id}/password`, data);
    console.log('Update customer password response:', response.data);
    return response.data;
  },

  // Delete a customer
  deleteCustomer: async (id: number): Promise<{ status: string; data: null }> => {
    console.log('Deleting customer ID:', id);
    const response = await apiClient.delete(`/customers/${id}`);
    console.log('Delete customer response:', response.data);
    return response.data;
  },

  // Get customer profile (for logged-in customer)
  getProfile: async (): Promise<CustomerResponse> => {
    console.log('Fetching customer profile');
    try {
      const response = await apiClient.get('/customers/profile');
      console.log('Get profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update customer profile (for logged-in customer)
  updateProfile: async (data: CustomerUpdateData): Promise<CustomerResponse> => {
    console.log('Updating customer profile with data:', { ...data });
    const response = await apiClient.put('/customers/profile', data);
    console.log('Update profile response:', response.data);
    return response.data;
  },

  // Update customer password (for logged-in customer)
  updatePassword: async (currentPassword: string, newPassword: string): Promise<{ status: string; message: string }> => {
    console.log('Updating customer password');
    const response = await apiClient.put('/customers/profile/password', {
      currentPassword,
      newPassword
    });
    console.log('Update password response:', response.data);
    return response.data;
  },

  // Get customer orders (admin)
  getCustomerOrders: async (customerId: number): Promise<any> => {
    console.log('Fetching orders for customer ID:', customerId);
    const response = await apiClient.get(`/customers/${customerId}/orders`);
    console.log('Get customer orders response:', response.data);
    return response.data;
  }
};

export default customerApi;