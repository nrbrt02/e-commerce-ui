// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from "../utils/authApi";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../constants/auth-constants";

// Types
export interface User {
  id: number | string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isStaff?: boolean;
  primaryRole?: string;
  role?: string; // Support for legacy role property
  roles?: Array<string | { name: string; permissions?: string[] }>;
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
  authModalView: "login" | "register" | "forgot-password";
  login: (email: string, password: string, isStaff?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  openAuthModal: (view?: "login" | "register" | "forgot-password") => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: "login" | "register" | "forgot-password") => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<
    "login" | "register" | "forgot-password"
  >("login");

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Loaded user from storage:", parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Helper function to determine primary role and staff status
  const processUserData = (userData: Record<string, any>): User => {
    console.log("Processing user data:", userData);
    
    // Start with a base user object
    const processedUser: User = {
      id: userData.id || 0,
      username: userData.username || "",
      email: userData.email || "",
      firstName: userData.firstName,
      lastName: userData.lastName,
      isStaff: false, // Will be set based on roles
      primaryRole: "customer", // Default role
      ...userData,
    };

    // Special case for customer login - set role explicitly if no roles array
    if (!userData.roles && !userData.role) {
      processedUser.role = 'customer';
      processedUser.primaryRole = 'customer';
      processedUser.isStaff = false;
      return processedUser;
    }

    // Preserve original roles array for reference
    if (userData.roles) {
      processedUser.roles = userData.roles;
    }

    // Check for directly assigned role property (some backends may provide this)
    if (userData.role) {
      processedUser.role = userData.role;
      processedUser.primaryRole = userData.role;
      processedUser.isStaff = userData.role !== "customer";
      return processedUser;
    }

    // Check if user has roles array
    if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
      console.log("Found roles array:", userData.roles);
      
      // Get all role names
      const roleNames: string[] = userData.roles.map((role) => {
        if (typeof role === 'string') {
          return role.toLowerCase();
        } else if (typeof role === 'object' && role !== null && 'name' in role) {
          return (role.name as string).toLowerCase();
        }
        return '';
      }).filter(Boolean);
      
      console.log("Extracted role names:", roleNames);

      // Determine primary role based on hierarchy
      if (roleNames.includes("superadmin")) {
        processedUser.primaryRole = "superadmin";
      } else if (roleNames.includes("admin")) {
        processedUser.primaryRole = "admin";
      } else if (roleNames.includes("manager")) {
        processedUser.primaryRole = "manager";
      } else if (roleNames.includes("supplier")) {
        processedUser.primaryRole = "supplier";
      }

      // Set staff status - anyone with a non-customer role is staff
      processedUser.isStaff = processedUser.primaryRole !== "customer";
      
      // Also set the legacy role property for compatibility
      processedUser.role = processedUser.primaryRole;
    }

    console.log("Processed user:", processedUser);
    return processedUser;
  };

  // Login function
  const login = async (
    email: string,
    password: string,
    isStaff: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call login API
      const response = await authApi.login(email, password, isStaff);

      console.log("Login API response:", response);

      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      
      // If refresh token is provided, store it too
      if (response.refreshToken) {
        localStorage.setItem("fast_shopping_refresh_token", response.refreshToken);
      }

      // Extract and process user data from the response
      let userData: Record<string, any> = {};
      
      // Try to extract user data from different response structures
      if (response.user) {
        // Direct user property
        userData = response.user;
      } else if (response.data && response.data.user) {
        // Nested user property in data object
        userData = response.data.user;
      }

      console.log("Extracted user data:", userData);
      
      const processedUser = processUserData(userData);

      // Store processed user
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(processedUser));

      // Update state
      setUser(processedUser);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to login. Please check your credentials.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - no auto-login
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call registration API
      const response = await authApi.register(data);

      // Registration successful, but we don't log in automatically
      console.log("Registration successful");

      // Try to get the username for logging purposes
      let username = "";
      if (response && typeof response === "object") {
        if (response.user && typeof response.user === "object") {
          username = response.user.username || data.username || data.email;
        } else if (response.data && response.data.user && typeof response.data.user === "object") {
          username = response.data.user.username || data.username || data.email;
        }
      }

      if (username) {
        console.log(`User ${username} created successfully`);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to register. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem("fast_shopping_refresh_token"); // Clear refresh token too
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Open auth modal
  const openAuthModal = (
    view: "login" | "register" | "forgot-password" = "login"
  ) => {
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
    setAuthModalView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};