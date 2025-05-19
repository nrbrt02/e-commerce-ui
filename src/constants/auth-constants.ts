// Auth token key for localStorage
export const AUTH_TOKEN_KEY = 'fast_shopping_auth_token';

// Auth user key for localStorage
export const AUTH_USER_KEY = 'fast_shopping_user';

export const REFRESH_TOKEN_KEY = "fast_shopping_refresh_token";
// API endpoints
export const AUTH_ENDPOINTS = {
  // Customer endpoints
  CUSTOMER_LOGIN: '/auth/customer/login',
  CUSTOMER_REGISTER: '/auth/customer/register',
  CUSTOMER_FORGOT_PASSWORD: '/auth/customer/forgot-password',
  CUSTOMER_RESET_PASSWORD: '/auth/customer/reset-password',
  CUSTOMER_VERIFY_EMAIL: '/auth/customer/verify-email',
  
  // Admin endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Supplier endpoints
  SUPPLIER_LOGIN: '/auth/supplier/login',
  SUPPLIER_REGISTER: '/auth/supplier/register',
  SUPPLIER_FORGOT_PASSWORD: '/auth/supplier/forgot-password',
  SUPPLIER_RESET_PASSWORD: '/auth/supplier/reset-password',
  SUPPLIER_VERIFY_EMAIL: '/auth/supplier/verify-email',
  
  // Common endpoints
  REFRESH_TOKEN: '/auth/refresh-token',
  CURRENT_USER: '/auth/me',
  
  // Legacy endpoints (backward compatibility)
  STAFF_LOGIN: '/auth/login'
};