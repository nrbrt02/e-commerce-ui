// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
/**
 * Hook for fetching products from the API
 * Using the proper API base URL from environment variables
 */
export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Get API base URL from environment variables
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Use the correct API base URL from environment variables
            const endpoint = `${apiBaseUrl}/products`;
            console.log('Fetching products from:', endpoint);
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            // Check for the expected data format based on your API response
            if (data.status === 'success' && data.data && data.data.products) {
                setProducts(data.data.products);
            }
            else {
                throw new Error('Invalid data format received from API');
            }
        }
        catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setProducts([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);
    return {
        products,
        isLoading,
        error,
        refetch: fetchProducts
    };
};
export default useProducts;
