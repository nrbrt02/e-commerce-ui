// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/apiClient";

// Types
export interface User {
  id: number | string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isStaff?: boolean;
  primaryRole?: string;
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

// Get environment variables
const AUTH_TOKEN_KEY =
  import.meta.env.VITE_AUTH_TOKEN_KEY || "fast_shopping_token";
const AUTH_USER_KEY =
  import.meta.env.VITE_AUTH_USER_KEY || "fast_shopping_user";

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
    // Start with a base user object
    const processedUser: User = {
      id: userData.id || 0,
      username: userData.username || "",
      email: userData.email || "",
      firstName: userData.firstName,
      lastName: userData.lastName,
      isStaff: false, // Will be set based on roles
      primaryRole: "customer", // Default role
      roles: userData.roles || [], // Preserve the roles array
      ...userData,
    };

    // Check if user has roles array
    if (userData.roles && Array.isArray(userData.roles)) {
      // Get all role names
      const roleNames = userData.roles.map((role) => role.name.toLowerCase());

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
      // else remains 'customer'

      // Set staff status - anyone with a non-customer role is staff
      processedUser.isStaff = processedUser.primaryRole !== "customer";
    }

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
      const response = await authAPI.login(email, password, isStaff);

      console.log("Login API response:", response);

      if (!response || !response.token) {
        throw new Error("Invalid response from server");
      }

      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);

      // Extract and process user data - safely access nested properties
      let userData: Record<string, any> = {};
      if (response && typeof response === "object") {
        // Handle different possible response structures
        if (
          "data" in response &&
          response.data &&
          typeof response.data === "object"
        ) {
          if ("user" in response.data) {
            userData = response.data.user as Record<string, any>;
          }
        } else if ("user" in response) {
          userData = response.user as Record<string, any>;
        }
      }

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
      const response = await authAPI.register(data);

      // Registration successful, but we don't log in automatically
      console.log("Registration successful");

      // Try to get the username for logging purposes
      let username = "";
      if (response && typeof response === "object") {
        if (
          "data" in response &&
          response.data &&
          typeof response.data === "object"
        ) {
          if (
            "user" in response.data &&
            response.data.user &&
            typeof response.data.user === "object"
          ) {
            const user = response.data.user as Record<string, any>;
            username = user.username || data.username || data.email;
          }
        } else if (
          "user" in response &&
          response.user &&
          typeof response.user === "object"
        ) {
          const user = response.user as Record<string, any>;
          username = user.username || data.username || data.email;
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
