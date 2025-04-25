// Export all API services
import apiService, { apiClient, createApiService } from './apiClient';
import customerApi from './customerApi';
import authApi from './authApi';

// Export services
export {
  apiService as default,
  apiClient,
  createApiService,
  customerApi,
  authApi

};

// Export types from services
export type * from './authApi';
export type * from './customerApi';
