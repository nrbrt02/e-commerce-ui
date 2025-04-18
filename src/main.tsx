// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import axios from 'axios';

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'fast_shopping_token';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Check for token in localStorage and set default auth header
const token = localStorage.getItem(AUTH_TOKEN_KEY);
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Log environment for debugging
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUGGING === 'true') {
  console.log('Environment:', import.meta.env.MODE);
  console.log('API Base URL:', API_BASE_URL);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);