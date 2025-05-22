// src/context/SearchContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

// Define types to match your API response
export interface SearchResult {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice?: string | null;
  costPrice?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital?: boolean;
  quantity: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    length: number;
  };
  metadata?: any;
  tags?: string[];
  imageUrls: string[];
  supplierId?: number;
  createdAt?: string;
  updatedAt?: string;
  supplier?: {
    id: number;
    username: string;
    email: string;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  }[];
  searchHighlights?: {
    name?: string;
    shortDescription?: string;
    tags?: string;
  };
}

interface PaginationData {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  pagination: PaginationData | null;
  performSearch: (searchQuery?: string) => Promise<void>;
  clearSearch: () => void;
  searchInCategory: (categoryId: number, searchQuery?: string) => Promise<void>;
  clearErrors: () => void;
}

// Create context
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Provider component
export const SearchProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const navigate = useNavigate();

  const clearErrors = useCallback(() => {
    setError(null);
  }, []);

  const performSearch = useCallback(async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) {
      console.log('Empty search query, skipping search');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Initiating search for:", finalQuery);
      
      // Using relative path for the API endpoint
      const response = await apiClient.get('/products/search', {
        params: { 
          query: finalQuery,
          page: 1, // Always start from page 1 for new searches
          limit: 20 // Set a reasonable limit
        }
      });
      
      console.log("Search response:", response.data);
      
      // Check if the response was successful
      if (response.data.status === 'success') {
        const products = response.data.data.products || [];
        console.log(`Found ${products.length} products`);
        setResults(products);
        setPagination(response.data.pagination || null);
      } else {
        console.error('Search error:', response.data);
        setError('An error occurred while searching. Please try again.');
        setResults([]);
        setPagination(null);
      }
      
      // Only navigate if we're not already on the search page with the same query
      const currentParams = new URLSearchParams(window.location.search);
      const currentQuery = currentParams.get('query');
      
      if (window.location.pathname !== '/search' || currentQuery !== finalQuery) {
        console.log('Navigating to search results page');
        navigate(`/search?query=${encodeURIComponent(finalQuery)}`);
      }
    } catch (err) {
      console.error('Search API error:', err);
      setError('An error occurred while searching. Please try again.');
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [query, navigate]);

  const searchInCategory = useCallback(async (categoryId: number, searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/products/search', {
        params: { 
          query: finalQuery,
          categoryId
        }
      });
      
      if (response.data.status === 'success') {
        setResults(response.data.data.products || []);
        setPagination(response.data.pagination || null);
      } else {
        console.error('Category search error:', response.data);
        setError('An error occurred while searching in this category. Please try again.');
        setResults([]);
        setPagination(null);
      }
      
      // Only navigate if we're not already on the search page with the same params
      const currentParams = new URLSearchParams(window.location.search);
      const currentQuery = currentParams.get('query');
      const currentCategory = currentParams.get('categoryId');
      
      if (window.location.pathname !== '/search' || 
          currentQuery !== finalQuery || 
          currentCategory !== categoryId.toString()) {
        navigate(`/search?query=${encodeURIComponent(finalQuery)}&categoryId=${categoryId}`);
      }
    } catch (err) {
      console.error('Category search API error:', err);
      setError('An error occurred while searching in this category. Please try again.');
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [query, navigate]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setPagination(null);
    setError(null);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        loading,
        error,
        pagination,
        performSearch,
        clearSearch,
        searchInCategory,
        clearErrors
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook for using the search context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};