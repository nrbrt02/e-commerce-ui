// src/components/home/HomePage.tsx
import React, { useMemo } from 'react';
import HeroBanner from './HeroBanner';
import ProductGrid from './ProductGrid';
// import CategoryGrid from './CategoryGrid';
// import BrandCarousel from './BrandCarousel';
import useProducts from '../../hooks/useProducts';

const HomePage: React.FC = () => {
  // Use our simplified hook to fetch all products
  const { products, isLoading, error } = useProducts();
  
  // Use memo to derive featured products from all products
  const featuredProducts = useMemo(() => {
    return products.filter(product => product.isFeatured);
  }, [products]);

  return (
    <div className="container mx-auto px-4">
      <div className="my-6">
        <HeroBanner />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="my-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
            <p className="font-medium">Error loading products:</p>
            <p>{error}</p>
          </div>
        ) : (
          <ProductGrid 
            title="All"
            highlightedText="Products"
            products={products}
            isLoading={isLoading}
          />
        )}
      </div>
      
      {featuredProducts.length > 0 && (
        <div className="my-8">
          <ProductGrid 
            title="Featured"
            highlightedText="Products"
            products={featuredProducts}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
    </div>
  );
};

export default HomePage;