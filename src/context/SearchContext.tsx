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

  const performSearch = useCallback(async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Searching for:", finalQuery);
      
      // Using your actual API endpoint and query parameter name
      const response = await apiClient.get('/products/search', {
        params: { query: finalQuery }
      });
      
      console.log("Search response:", response.data);
      
      // Check if the response was successful
      if (response.data.status === 'success') {
        setResults(response.data.data.products || []);
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
        searchInCategory
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