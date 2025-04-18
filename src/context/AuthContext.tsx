// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/apiClient';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isStaff?: boolean;
  role?: string;
  roles?: string[];
  [key: string]: any; // For any additional properties
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register' | 'forgot-password';
  login: (email: string, password: string, isStaff?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  openAuthModal: (view?: 'login' | 'register' | 'forgot-password') => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: 'login' | 'register' | 'forgot-password') => void;
}

// Get environment variables
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'fast_shopping_token';
const AUTH_USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || 'fast_shopping_user';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        // If there's an error, clear local storage to be safe
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string, isStaff: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password, isStaff);
      
      // Log for debugging
      console.log('Login successful:', response);
      
      // Make sure we have the necessary data
      if (!response.token || !response.user) {
        throw new Error('Invalid response from server: missing token or user data');
      }
      
      // Save token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      
      // Add isStaff flag if it doesn't exist in the user object
      const userToStore = {
        ...response.user,
        isStaff: isStaff || 
                response.user.isStaff || 
                response.user.role === 'admin' ||
                response.user.role === 'manager' ||
                response.user.role === 'supplier' ||
                (response.user.roles && (
                  response.user.roles.includes('admin') ||
                  response.user.roles.includes('manager') ||
                  response.user.roles.includes('supplier')
                ))
      };
      
      // Store the enhanced user object
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToStore));
      
      // Update state
      setUser(userToStore);
      setIsAuthenticated(true);
      
      // Close auth modal if open
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Login error:', err);
      // Extract error message from different possible response formats
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message ||
                          'Failed to login. Please check your credentials.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // No need to modify the data object here, the API client will handle the endpoints
      // and data formatting based on the isStaff flag
      const response = await authAPI.register(data);
      
      // Save token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      
      // For supplier users, ensure the role property is set correctly
      const userToStore = {
        ...response.user,
        isStaff: data.isStaff,
        role: data.isStaff ? 'supplier' : response.user.role
      };
      
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToStore));
      
      // Update state
      setUser(userToStore);
      setIsAuthenticated(true);
      
      // Close auth modal if open
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Open auth modal
  const openAuthModal = (view: 'login' | 'register' | 'forgot-password' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  // Close auth modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Auth context value
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAuthModalOpen,
    authModalView,
    login,
    register,
    logout,
    clearError,
    openAuthModal,
    closeAuthModal,
    setAuthModalView
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};