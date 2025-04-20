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

  // Sample data for categories
  // const categories = [
  //   {
  //     id: 1,
  //     name: "Mobile",
  //     icon: "/api/placeholder/40/40",
  //     isActive: true
  //   },
  //   {
  //     id: 2,
  //     name: "Cosmetics",
  //     icon: "/api/placeholder/40/40"
  //   },
  //   {
  //     id: 3,
  //     name: "Electronics",
  //     icon: "/api/placeholder/40/40"
  //   },
  //   {
  //     id: 4,
  //     name: "Furniture",
  //     icon: "/api/placeholder/40/40"
  //   },
  //   {
  //     id: 5,
  //     name: "Watches",
  //     icon: "/api/placeholder/40/40"
  //   },
  //   {
  //     id: 6,
  //     name: "Decor",
  //     icon: "/api/placeholder/40/40"
  //   },
  //   {
  //     id: 7,
  //     name: "Accessories",
  //     icon: "/api/placeholder/40/40"
  //   }
  // ];

  // // Sample data for brands
  // const brands = [
  //   {
  //     id: 1,
  //     name: "IPHONE",
  //     logo: "/api/placeholder/30/30",
  //     image: "/api/placeholder/100/150",
  //     discount: "UP to 80% OFF",
  //     bgColor: "bg-gray-900",
  //     textColor: "text-gray-400"
  //   },
  //   {
  //     id: 2,
  //     name: "REALME",
  //     logo: "/api/placeholder/30/30",
  //     image: "/api/placeholder/100/150",
  //     discount: "UP to 80% OFF",
  //     bgColor: "bg-yellow-100",
  //     textColor: "text-yellow-600"
  //   },
  //   {
  //     id: 3,
  //     name: "XIAOMI",
  //     logo: "/api/placeholder/30/30",
  //     image: "/api/placeholder/100/150",
  //     discount: "UP to 80% OFF",
  //     bgColor: "bg-orange-100",
  //     textColor: "text-orange-600"
  //   }
  // ];

  return (
    <div className="container mx-auto px-4">
      <div className="my-6">
        <HeroBanner />
      </div>
      
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
      
      {/* <div className="my-8">
        <CategoryGrid 
          title="Shop From"
          highlightedText="Top Categories"
          categories={categories}
        />
      </div> */}
      
      {/* <div className="my-8">
        <BrandCarousel 
          title="Top"
          highlightedText="Electronics Brands"
          brands={brands}
        />
      </div> */}
    </div>
  );
};

export default HomePage;