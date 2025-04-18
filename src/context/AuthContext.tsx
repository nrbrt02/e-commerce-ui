import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Auth API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
};

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roles?: string[];
  isStaff?: boolean;
  isVerified?: boolean;
}

// Registration data interface
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

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register' | 'forgot-password';
  login: (email: string, password: string, isStaff?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  openAuthModal: (view?: 'login' | 'register' | 'forgot-password') => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: 'login' | 'register' | 'forgot-password') => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authModalView: 'login',
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  clearError: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  setAuthModalView: () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Check for existing token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Configure axios with token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        // In a real app, make this request to verify the token
        // const response = await axios.get(AUTH_ENDPOINTS.VERIFY_TOKEN);
        
        // For development, simulate a successful verification
        // This would be replaced with actual API call in production
        const mockUserData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (mockUserData && mockUserData.id) {
          setUser(mockUserData);
          setIsAuthenticated(true);
        } else {
          // If user data is missing, clear auth state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (err) {
        // Token verification failed, clear auth state
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Login function
  const login = async (email: string, password: string, isStaff: boolean = false) => {
    try {
      setError(null);
      // In a real app, this would call your backend API
      // const response = await axios.post(AUTH_ENDPOINTS.LOGIN, { email, password, isStaff });

      // For development, simulate a successful login
      // This would be replaced with actual API call in production
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: email.split('@')[0],
          email,
          firstName: 'John',
          lastName: 'Doe',
          role: isStaff ? 'admin' : undefined,
          isStaff: isStaff,
          isVerified: true
        }
      };

      // Store token and user data
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockResponse.token}`;
      
      // Update auth state
      setUser(mockResponse.user);
      setIsAuthenticated(true);
      
      // Close the auth modal if it's open
      setIsAuthModalOpen(false);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
      throw err;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setError(null);
      // In a real app, this would call your backend API
      // const response = await axios.post(AUTH_ENDPOINTS.REGISTER, data);

      // For development, simulate a successful registration
      // This would be replaced with actual API call in production
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: data.username,
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          role: data.isStaff ? data.role : undefined,
          isStaff: data.isStaff,
          isVerified: false
        }
      };

      // Store token and user data
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockResponse.token}`;
      
      // Update auth state
      setUser(mockResponse.user);
      setIsAuthenticated(true);
      
      // Close the auth modal if it's open
      setIsAuthModalOpen(false);

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    // Clear token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update auth state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Auth modal functions
  const openAuthModal = (view: 'login' | 'register' | 'forgot-password' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    clearError();
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAuthModalOpen,
        authModalView,
        login,
        register,
        logout,
        error,
        clearError,
        openAuthModal,
        closeAuthModal,
        setAuthModalView
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);