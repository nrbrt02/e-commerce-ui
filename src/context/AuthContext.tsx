import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import authApi from "../utils/authApi";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../constants/auth-constants";
import { showToast } from "../components/ui/ToastProvider";

// Types
export interface User {
  id: number | string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isStaff?: boolean;
  primaryRole?: string;
  role?: string; 
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
  // Additional fields for supplier
  companyName?: string;
  contactPerson?: string;
  businessAddress?: string;
  taxId?: string;
}

export type UserType = "customer" | "admin" | "supplier";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalView: "login" | "register" | "forgot-password";
  userType: UserType;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  register: (data: RegisterData, userType: UserType) => Promise<void>;
  forgotPassword: (email: string, userType: UserType) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  openAuthModal: (view?: "login" | "register" | "forgot-password", type?: UserType) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: "login" | "register" | "forgot-password") => void;
  setUserType: (type: UserType) => void;
  checkAuthStatus: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
const [userType, setUserType] = useState<UserType>("customer");
const [authModalView, setAuthModalView] = useState<"login" | "register" | "forgot-password">("login");

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Helper function to determine primary role and staff status
  const processUserData = (userData: Record<string, any>, type: UserType): User => {
    console.log("Processing user data:", userData);
    
    // Start with a base user object
    const processedUser: User = {
      id: userData.id || 0,
      username: userData.username || "",
      email: userData.email || "",
      firstName: userData.firstName || userData.firstname || userData.contactPerson,
      lastName: userData.lastName || userData.lastname,
      isStaff: type !== "customer", // Admin and supplier are considered staff
      primaryRole: type, // Set role based on login type
      role: type, // Also set the legacy role property
      ...userData,
    };

    // If there's a supplier specific field, add it
    if (type === "supplier" && userData.companyName) {
      processedUser.companyName = userData.companyName;
    }
    
    if (type === "supplier" && userData.contactPerson) {
      processedUser.contactPerson = userData.contactPerson;
    }

    // Handle roles array if it exists
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
        processedUser.role = "superadmin";
      } else if (roleNames.includes("admin")) {
        processedUser.primaryRole = "admin";
        processedUser.role = "admin";
      } else if (roleNames.includes("manager")) {
        processedUser.primaryRole = "manager";
        processedUser.role = "manager";
      } else if (roleNames.includes("supplier")) {
        processedUser.primaryRole = "supplier";
        processedUser.role = "supplier";
      }
    }

    console.log("Processed user:", processedUser);
    return processedUser;
  };

  // Check auth status function
  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user from storage:", parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Set user type based on the stored user
        if (parsedUser.role === "supplier" || parsedUser.primaryRole === "supplier") {
          setUserType("supplier");
        } else if (
          parsedUser.isStaff || 
          parsedUser.role === "admin" || 
          parsedUser.role === "superadmin" ||
          parsedUser.primaryRole === "admin" ||
          parsedUser.primaryRole === "superadmin"
        ) {
          setUserType("admin");
        } else {
          setUserType("customer");
        }
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect user based on role after login
const redirectAfterLogin = (userRole: string) => {
  if (userRole === "admin" || userRole === "superadmin" || userRole === "supplier") {
    navigate("/dashboard");
  } else {
    navigate("/account");
  }
};

  // Login function based on user type
  const login = async (
    email: string,
    password: string,
    loginUserType: UserType = "customer"
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Attempting ${loginUserType} login with:`, { email, password: '[REDACTED]' });
      
      // Call the appropriate login API based on user type
      let response;
      switch (loginUserType) {
        case "customer":
          response = await authApi.loginCustomer(email, password);
          break;
        case "supplier":
          response = await authApi.loginSupplier(email, password);
          break;
        case "admin":
          response = await authApi.loginAdmin(email, password);
          break;
        default:
          throw new Error("Invalid user type");
      }

      console.log(`${loginUserType} Login API response:`, response);

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
      if (loginUserType === "customer") {
        userData = response.customer || (response.data && response.data.customer) || {};
      } else if (loginUserType === "supplier") {
        userData = response.supplier || (response.data && response.data.supplier) || {};
      } else if (loginUserType === "admin") {
        userData = response.user || (response.data && response.data.user) || {};
      }

      console.log("Extracted user data:", userData);
      
      // Process the user data based on the user type
      const processedUser = processUserData(userData, loginUserType);

      // Store processed user
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(processedUser));

      // Update state
      setUser(processedUser);
      setIsAuthenticated(true);
      setUserType(loginUserType);
      setIsAuthModalOpen(false);

      // Show success toast
      showToast.success(`Successfully logged in as ${loginUserType}`);

      // Redirect user based on role
      let redirectRole = processedUser.primaryRole || processedUser.role || loginUserType;
      redirectAfterLogin(redirectRole);

      // Return success
      return true;
    } catch (err: any) {
      console.error(`${loginUserType} Login error:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        `Failed to login as ${loginUserType}. Please check your credentials.`;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function based on user type
  const register = async (data: RegisterData, registerUserType: UserType = "customer") => {
    setIsLoading(true);
    setError(null);

    try {
      // Call registration API based on user type
      let response;
      switch (registerUserType) {
        case "customer":
          response = await authApi.registerCustomer(data);
          break;
        case "supplier":
          response = await authApi.registerSupplier(data);
          break;
        case "admin":
          response = await authApi.registerAdmin(data);
          break;
        default:
          throw new Error("Invalid user type");
      }

      // Registration successful
      console.log(`${registerUserType} Registration successful`);

      // Show success toast
      showToast.success("Registration successful. Please log in.");

      // Try to get the username for logging purposes
      let username = "";
      if (response && typeof response === "object") {
        if (registerUserType === "customer" && response.customer) {
          username = response.customer.username || data.username || data.email;
        } else if (registerUserType === "supplier" && response.supplier) {
          username = response.supplier.username || data.username || data.email;
        } else if (registerUserType === "admin" && response.user) {
          username = response.user.username || data.username || data.email;
        } else if (response.data) {
          if (registerUserType === "customer" && response.data.customer) {
            username = response.data.customer.username || data.username || data.email;
          } else if (registerUserType === "supplier" && response.data.supplier) {
            username = response.data.supplier.username || data.username || data.email;
          } else if (registerUserType === "admin" && response.data.user) {
            username = response.data.user.username || data.username || data.email;
          }
        }
      }

      if (username) {
        console.log(`User ${username} created successfully as ${registerUserType}`);
      }
    } catch (err: any) {
      console.error(`${registerUserType} Registration error:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        `Failed to register as ${registerUserType}. Please try again.`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string, forgotPassUserType: UserType = "customer"): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the appropriate forgot password API based on user type
      let response;
      switch (forgotPassUserType) {
        case "customer":
          response = await authApi.forgotPasswordCustomer(email);
          break;
        case "supplier":
          response = await authApi.forgotPasswordSupplier(email);
          break;
        case "admin":
          response = await authApi.forgotPasswordAdmin(email);
          break;
        default:
          throw new Error("Invalid user type");
      }

      console.log(`${forgotPassUserType} Forgot password response:`, response);

      // Show success toast
      showToast.success("Password reset instructions have been sent to your email address.");

      return true;
    } catch (err: any) {
      console.error(`${forgotPassUserType} Forgot password error:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send reset instructions. Please try again.";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function with redirection to home page
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem("fast_shopping_refresh_token"); // Clear refresh token too
    setUser(null);
    setIsAuthenticated(false);
    setUserType("customer");
    
    // Show success toast
    showToast.success("You have been logged out successfully");
    
    // Redirect to home page
    navigate('/');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Open auth modal
  const openAuthModal = (
    view: "login" | "register" | "forgot-password" = "login",
    type: UserType = "customer"
  ) => {
    setAuthModalView(view);
    setUserType(type);
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
    userType,
    login,
    register,
    forgotPassword,
    logout,
    clearError,
    openAuthModal,
    closeAuthModal,
    setAuthModalView,
    setUserType,
    checkAuthStatus,
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