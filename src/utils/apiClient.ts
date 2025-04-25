import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, AUTH_ENDPOINTS } from '../constants/auth-constants';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Check for inconsistent token storage
const checkAndMigrateTokens = () => {
  // Alternative token keys that might be used in different parts of the app
  const possibleTokenKeys = [
    'fast-shopping-auth-token',
    'authToken',
    'fast-shopping-token'
  ];
  
  // Check if we don't have a token under our primary key but it exists in another key
  if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key);
      if (token && key !== AUTH_TOKEN_KEY) {
        console.log(`Found token under different key "${key}", migrating to "${AUTH_TOKEN_KEY}"`);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        break;
      }
    }
  }
  
  // Similar check for refresh token
  const possibleRefreshKeys = ['refreshToken', 'refresh_token', 'fast-shopping-refresh-token'];
  if (!localStorage.getItem(REFRESH_TOKEN_KEY)) {
    for (const key of possibleRefreshKeys) {
      const token = localStorage.getItem(key);
      if (token && key !== REFRESH_TOKEN_KEY) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
        break;
      }
    }
  }
};

// Run the token migration check when module is loaded
checkAndMigrateTokens();

// Create a base axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS requests with credentials
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage using the constant key
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (token && config.headers) {
      // Properly set the Authorization header with Bearer prefix
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Setting auth header with token for request to: ${config.url}`);
    } else {
      console.log(`No token found for request to: ${config.url}`);
      
      // For debugging: Check if user object exists in localStorage
      const userJson = localStorage.getItem('fast_shopping_user');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log('User exists in localStorage but no token found:', 
            user.id ? `ID: ${user.id}` : 'No user ID');
        } catch (e) {
          console.error('Failed to parse user JSON:', e);
        }
      } else {
        console.log('No user found in localStorage');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response success for ${response.config.url}:`, { 
      status: response.status,
      data: response.data ? 'data present' : 'no data'
    });
    return response;
  },
  async (error) => {
    // Log the error for debugging
    console.error(`Response error for ${error.config?.url}:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data || 'No data'
    });
    
    const originalRequest = error.config;

    // Handle token refresh if 401 (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if we have a refresh token
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...');
          originalRequest._retry = true;
          
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
            refreshToken
          });
          
          // If successful, update tokens
          if (response.data.token) {
            console.log('Token refresh successful');
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
            
            if (response.data.refreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
            }
            
            // Update the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // If refresh fails, log the user out
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem('refreshToken'); // Remove legacy key too
          
          // Log out only if configured to do so
          if (window.location.pathname.includes('/account') || 
              window.location.pathname.includes('/dashboard')) {
            // Redirect to login page if needed and not already there
            if (!window.location.pathname.includes('/account/login')) {
              window.location.href = '/account/login?expired=true';
            }
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        console.warn('401 response but no refresh token available');
        
        // For development only: Log the current token to help debug
        const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);
        console.log('Current token at error time:', currentToken ? 'present' : 'not present');
        
        // Only handle auth redirect for account and dashboard pages
        // This prevents redirects from public pages that might just have permission issues
        if ((window.location.pathname.includes('/account') || 
             window.location.pathname.includes('/dashboard')) &&
            !window.location.pathname.includes('/account/login')) {
          // Remove tokens before redirect
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem('refreshToken'); // Remove legacy key too
          
          window.location.href = '/account/login?session=expired';
        }
      }
    }
    
    // For wishlist-specific errors, provide more detailed information
    if (error.config?.url?.includes('/wishlists')) {
      if (error.response?.status === 401) {
        console.error('Unauthorized wishlist access:', {
          wishlistEndpoint: error.config.url,
          authHeader: error.config.headers?.Authorization ? 'present' : 'missing',
          token: localStorage.getItem(AUTH_TOKEN_KEY) ? 'token in storage' : 'no token in storage'
        });
      } else if (error.response?.status === 404) {
        console.error('Wishlist not found or access denied:', {
          wishlistEndpoint: error.config.url,
          authHeader: error.config.headers?.Authorization ? 'present' : 'missing'
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// Create a generic API service with common methods
export const createApiService = <T>(endpoint: string) => {
  return {
    getAll: async (params = {}): Promise<T[]> => {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    },
    
    getById: async (id: number | string): Promise<T> => {
      const response = await apiClient.get(`${endpoint}/${id}`);
      return response.data;
    },
    
    create: async (data: Partial<T>): Promise<T> => {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    },
    
    update: async (id: number | string, data: Partial<T>): Promise<T> => {
      const response = await apiClient.put(`${endpoint}/${id}`, data);
      return response.data;
    },
    
    delete: async (id: number | string): Promise<void> => {
      await apiClient.delete(`${endpoint}/${id}`);
    },
    
    // Custom request for more complex scenarios
    customRequest: async <R>(config: AxiosRequestConfig): Promise<R> => {
      const response = await apiClient(config);
      return response.data;
    }
  };
};

// Export a default apiService for common use cases
const apiService = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  delete: apiClient.delete,
  patch: apiClient.patch
};

export default apiService;