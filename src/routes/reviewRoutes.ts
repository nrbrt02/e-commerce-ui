// src/routes/reviewRoutes.ts
import express from 'express';
// import { apiClient } from '../utils/apiClient';
import { AUTH_TOKEN_KEY } from '../constants/auth-constants';

const router = express.Router();

// Public routes for product reviews
// These routes don't require authentication
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/products/:productId/reviews/stats', reviewStatsController.getProductReviewStats);
router.get('/:id', reviewController.getReviewById);

// Routes for authenticated users
// Instead of using middleware, we'll check for the token in the controller functions
router.post('/products/:productId/reviews', async (req, res, next) => {
  // Check if the authorization header exists
  const token = req.headers.authorization?.split(' ')[1] || localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You must be logged in to submit a review'
    });
  }
  
  // Set the token in the request for use in the controller
  req.headers.authorization = `Bearer ${token}`;
  
  // Call the controller
  return reviewController.createReview(req, res, next);
});

router.put('/:id', async (req, res, next) => {
  // Check if the authorization header exists
  const token = req.headers.authorization?.split(' ')[1] || localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You must be logged in to update a review'
    });
  }
  
  // Set the token in the request for use in the controller
  req.headers.authorization = `Bearer ${token}`;
  
  // Call the controller
  return reviewController.updateReview(req, res, next);
});

router.delete('/:id', async (req, res, next) => {
  // Check if the authorization header exists
  const token = req.headers.authorization?.split(' ')[1] || localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You must be logged in to delete a review'
    });
  }
  
  // Set the token in the request for use in the controller
  req.headers.authorization = `Bearer ${token}`;
  
  // Call the controller
  return reviewController.deleteReview(req, res, next);
});

router.post('/:id/vote', async (req, res, next) => {
  // Check if the authorization header exists
  const token = req.headers.authorization?.split(' ')[1] || localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You must be logged in to vote on a review'
    });
  }
  
  // Set the token in the request for use in the controller
  req.headers.authorization = `Bearer ${token}`;
  
  // Call the controller
  return reviewController.voteReviewHelpful(req, res, next);
});

router.get('/customer/me', async (req, res, next) => {
  // Check if the authorization header exists
  const token = req.headers.authorization?.split(' ')[1] || localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You must be logged in to view your reviews'
    });
  }
  
  // Set the token in the request for use in the controller
  req.headers.authorization = `Bearer ${token}`;
  
  // Call the controller
  return reviewController.getCustomerReviews(req, res, next);
});

export default router;