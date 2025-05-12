import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from '../home/ProductGrid';

const ProductGridPage: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the environment variable for the base URL
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`);
        
        // Axios automatically parses JSON and puts the response data in .data property
        // Assuming the API response structure matches what you provided earlier
        if (response.data && response.data.data && response.data.data.products) {
          setProducts(response.data.data.products);
        } else {
          throw new Error("Invalid data structure in API response");
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(axios.isAxiosError(error) 
          ? error.message 
          : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>Error loading products: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGrid 
        title="All Products"
        highlightedText="Collection"
        products={products}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductGridPage;