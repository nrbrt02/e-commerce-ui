import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    imageUrls: string[];
  };
}

// Customer endpoints
export const getCustomerReviews = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/admin/all`, {
    params: { page, limit }
  });
  return response.data;
};

export const voteReviewHelpful = async (id: string) => {
  const response = await axios.post(`${API_BASE_URL}/reviews/${id}/vote`);
  return response.data;
};

export const updateReview = async (id: string, reviewData: Partial<Review>) => {
  const response = await axios.put(`${API_BASE_URL}/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/reviews/${id}`);
  return response.data;
};

// Admin endpoints
export const getAllReviews = async (page = 1, limit = 10, filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/admin/all`, {
    params: { page, limit, ...filters }
  });
  return response.data;
};

export const toggleReviewApproval = async (id: string) => {
  const response = await axios.patch(`${API_BASE_URL}/reviews/${id}/approve`);
  return response.data;
};

export const toggleVerifiedPurchase = async (id: string) => {
  const response = await axios.patch(`${API_BASE_URL}/reviews/${id}/verify`);
  return response.data;
};

// Public endpoints
export const getReviewById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/${id}`);
  return response.data;
};