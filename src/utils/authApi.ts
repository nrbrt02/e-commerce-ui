import { apiClient } from './apiClient';
import { AUTH_TOKEN_KEY, AUTH_ENDPOINTS } from '../constants/auth-constants';

// Types
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  status?: string;
  data?: {
    user?: {
      id: number | string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles?: string[] | { name: string; permissions?: string[] }[];
      role?: string;
      [key: string]: any;
    };
    customer?: {
      id: number | string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      [key: string]: any;
    };
    supplier?: {
      id: number | string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      [key: string]: any;
    };
  };
  user?: {
    id: number | string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[] | { name: string; permissions?: string[] }[];
    role?: string;
    [key: string]: any;
  };
  customer?: {
    id: number | string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  supplier?: {
    id: number | string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isStaff?: boolean;
  role?: string;
}

export interface RegisterResponse {
  status?: string;
  success?: boolean;
  message?: string;
  token?: string;
  data?: {
    user?: {
      id: number | string;
      username: string;
      email: string;
      [key: string]: any;
    };
    customer?: {
      id: number | string;
      username: string;
      email: string;
      [key: string]: any;
    };
    supplier?: {
      id: number | string;
      username: string;
      email: string;
      [key: string]: any;
    };
  };
  user?: {
    id: number | string;
    username: string;
    email: string;
    [key: string]: any;
  };
  customer?: {
    id: number | string;
    username: string;
    email: string;
    [key: string]: any;
  };
  supplier?: {
    id: number | string;
    username: string;
    email: string;
    [key: string]: any;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Export constants for compatibility with existing code
export { AUTH_TOKEN_KEY };

// Auth API service
const authApi = {
  // Customer login
  loginCustomer: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log(`Attempting customer login with email: ${email}`);
      
      const response = await apiClient.post(AUTH_ENDPOINTS.CUSTOMER_LOGIN, {
        email,
        password,
      }, { timeout: 10000 });
      
      console.log('Customer login response received:', response.status);
      console.log('Response structure:', {
        hasToken: !!response.data.token || !!(response.data.data && response.data.data.token),
        hasCustomer: !!response.data.customer || !!(response.data.data && response.data.data.customer),
        statusCode: response.status,
        responseKeys: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Customer login request failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  },
  
  // Admin login
  loginAdmin: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log(`Attempting admin login with email: ${email}`);
      
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      }, { timeout: 10000 });
      
      console.log('Admin login response received:', response.status);
      console.log('Response structure:', {
        hasToken: !!response.data.token || !!(response.data.data && response.data.data.token),
        hasUser: !!response.data.user || !!(response.data.data && response.data.data.user),
        statusCode: response.status,
        responseKeys: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Admin login request failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  
  // Supplier login
  loginSupplier: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log(`Attempting supplier login with email: ${email}`);
      
      const response = await apiClient.post(AUTH_ENDPOINTS.SUPPLIER_LOGIN, {
        email,
        password,
      }, { timeout: 10000 });
      
      console.log('Supplier login response received:', response.status);
      console.log('Response structure:', {
        hasToken: !!response.data.token || !!(response.data.data && response.data.data.token),
        hasSupplier: !!response.data.supplier || !!(response.data.data && response.data.data.supplier),
        statusCode: response.status,
        responseKeys: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Supplier login request failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  
  // Customer register
  registerCustomer: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      console.log(`Registering customer`, { 
        ...data, 
        password: '[REDACTED]' 
      });
      
      const response = await apiClient.post(AUTH_ENDPOINTS.CUSTOMER_REGISTER, data, { timeout: 10000 });
      console.log('Customer registration response:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasCustomer: !!response.data.customer || !!(response.data.data && response.data.data.customer)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Customer registration request failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  
  // Admin register
  registerAdmin: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      console.log(`Registering admin`, { 
        ...data, 
        password: '[REDACTED]' 
      });
      
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, {
        ...data,
        role: 'admin'
      }, { timeout: 10000 });
      
      console.log('Admin registration response:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user || !!(response.data.data && response.data.data.user)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Admin registration request failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  
  // Supplier register
  registerSupplier: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      console.log(`Registering supplier`, { 
        ...data, 
        password: '[REDACTED]' 
      });
      
      const response = await apiClient.post(AUTH_ENDPOINTS.SUPPLIER_REGISTER, data, { timeout: 10000 });
      
      console.log('Supplier registration response:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasSupplier: !!response.data.supplier || !!(response.data.data && response.data.data.supplier)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Supplier registration request failed:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw error;
    }
  },
  
  // Forgot password - Customer
  forgotPasswordCustomer: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.CUSTOMER_FORGOT_PASSWORD, { 
        email,
        userType: 'customer'
      });
      return response.data;
    } catch (error) {
      console.error('Customer forgot password request failed:', error);
      throw error;
    }
  },
  
  // Forgot password - Admin
  forgotPasswordAdmin: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { 
        email,
        userType: 'admin'
      });
      return response.data;
    } catch (error) {
      console.error('Admin forgot password request failed:', error);
      throw error;
    }
  },
  
  // Forgot password - Supplier
  forgotPasswordSupplier: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.SUPPLIER_FORGOT_PASSWORD, { 
        email,
        userType: 'supplier'
      });
      return response.data;
    } catch (error) {
      console.error('Supplier forgot password request failed:', error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (data: ResetPasswordData, userType: string = 'customer'): Promise<ResetPasswordResponse> => {
    const endpoint = 
      userType === 'admin' ? AUTH_ENDPOINTS.RESET_PASSWORD :
      userType === 'supplier' ? AUTH_ENDPOINTS.SUPPLIER_RESET_PASSWORD :
      AUTH_ENDPOINTS.CUSTOMER_RESET_PASSWORD;
    
    try {
      const response = await apiClient.post(endpoint, {
        ...data,
        userType
      });
      return response.data;
    } catch (error) {
      console.error(`${userType} reset password request failed:`, error);
      throw error;
    }
  },
  
  // Verify email
  verifyEmail: async (token: string, userType: string = 'customer'): Promise<{ success: boolean; message: string }> => {
    const endpoint = 
      userType === 'admin' ? AUTH_ENDPOINTS.VERIFY_EMAIL :
      userType === 'supplier' ? AUTH_ENDPOINTS.SUPPLIER_VERIFY_EMAIL :
      AUTH_ENDPOINTS.CUSTOMER_VERIFY_EMAIL;
    
    try {
      const response = await apiClient.post(endpoint, { 
        token,
        userType
      });
      return response.data;
    } catch (error) {
      console.error(`${userType} email verification request failed:`, error);
      throw error;
    }
  },
  
  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
      return response.data;
    } catch (error) {
      console.error('Token refresh request failed:', error);
      throw error;
    }
  },
  
  // Get current user profile
  getCurrentUser: async (): Promise<any> => {
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.CURRENT_USER);
      return response.data;
    } catch (error) {
      console.error('Get current user request failed:', error);
      throw error;
    }
  },
};

export default authApi;