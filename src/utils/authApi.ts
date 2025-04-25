// src/utils/authApi.ts
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
  };
  user?: {
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
  login: async (email: string, password: string, isStaff: boolean = false): Promise<LoginResponse> => {
    // Use endpoints from constants
    const endpoint = !isStaff ? AUTH_ENDPOINTS.LOGIN : AUTH_ENDPOINTS.STAFF_LOGIN;
    
    try {
      console.log(`Attempting login with email: ${email}, isStaff: ${isStaff}, endpoint: ${endpoint}`);
      
      // Add timeout for better error handling
      const response = await apiClient.post(endpoint, {
        email,
        password,
      }, { timeout: 10000 }); // 10 second timeout
      
      console.log('Login response received:', response.status);
      
      // More detailed response logging (without sensitive data)
      console.log('Response structure:', {
        hasToken: !!response.data.token || !!(response.data.data && response.data.data.token),
        hasUser: !!response.data.user || !!(response.data.data && response.data.data.user),
        statusCode: response.status,
        responseKeys: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Login request failed:', error);
      
      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
      }
      
      throw error;
    }
  },
  
  // Register
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    // Use endpoints from constants
    const endpoint = !data.isStaff ? AUTH_ENDPOINTS.CUSTOMER_REGISTER : AUTH_ENDPOINTS.REGISTER;
    
    try {
      console.log(`Registering user with ${endpoint}`, { 
        ...data, 
        password: '[REDACTED]' 
      });
      
      const response = await apiClient.post(endpoint, data, { timeout: 10000 });
      console.log('Registration response:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user || !!(response.data.data && response.data.data.user)
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Registration request failed:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },
  
  // Forgot password
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<ResetPasswordResponse> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      console.error('Reset password request failed:', error);
      throw error;
    }
  },
  
  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
      return response.data;
    } catch (error) {
      console.error('Email verification request failed:', error);
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