/**
 * Centralized constants for authentication
 * These values should be used consistently across the application
 */

// Token storage keys
export const AUTH_TOKEN_KEY = "fast_shopping_token";
export const AUTH_USER_KEY = "fast_shopping_user";
export const REFRESH_TOKEN_KEY = "fast_shopping_refresh_token";

// API endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/customer/login',
  STAFF_LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CUSTOMER_REGISTER: '/auth/customer/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  REFRESH_TOKEN: '/auth/refresh-token',
  CURRENT_USER: '/auth/me'
};