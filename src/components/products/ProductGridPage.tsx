import React, { useState, useEffect } from 'react';
import ProductGrid from '../home/ProductGrid';

const ProductGridPage: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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