import React from 'react';
import HeroBanner from './HeroBanner';
import ProductGrid from './ProductGrid';
import CategoryGrid from './CategoryGrid';
import BrandCarousel from './BrandCarousel';

const HomePage: React.FC = () => {
  // Sample data for smartphones
  const smartphones = [
    {
      id: 1,
      name: "Galaxy S22 Ultra",
      image: "/api/placeholder/150/200",
      currentPrice: 32999,
      originalPrice: 74999,
      discount: 55,
      savings: 22000
    },
    {
      id: 2,
      name: "Galaxy M13 (4GB | 64 GB)",
      image: "/api/placeholder/150/200",
      currentPrice: 10499,
      originalPrice: 14999,
      discount: 55,
      savings: 4500
    },
    {
      id: 3,
      name: "Galaxy M33 (4GB | 64 GB)",
      image: "/api/placeholder/150/200",
      currentPrice: 16999,
      originalPrice: 24999,
      discount: 55,
      savings: 8000
    },
    {
      id: 4,
      name: "Galaxy M53 (4GB | 64 GB)",
      image: "/api/placeholder/150/200",
      currentPrice: 31999,
      originalPrice: 40999,
      discount: 55,
      savings: 9000
    },
    {
      id: 5,
      name: "Galaxy S22 Ultra",
      image: "/api/placeholder/150/200",
      currentPrice: 67999,
      originalPrice: 86999,
      discount: 55,
      savings: 18000
    }
  ];

  // Sample data for categories
  const categories = [
    {
      id: 1,
      name: "Mobile",
      icon: "/api/placeholder/40/40",
      isActive: true
    },
    {
      id: 2,
      name: "Cosmetics",
      icon: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Electronics",
      icon: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "Furniture",
      icon: "/api/placeholder/40/40"
    },
    {
      id: 5,
      name: "Watches",
      icon: "/api/placeholder/40/40"
    },
    {
      id: 6,
      name: "Decor",
      icon: "/api/placeholder/40/40"
    },
    {
      id: 7,
      name: "Accessories",
      icon: "/api/placeholder/40/40"
    }
  ];

  // Sample data for brands
  const brands = [
    {
      id: 1,
      name: "IPHONE",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/100/150",
      discount: "UP to 80% OFF",
      bgColor: "bg-gray-900",
      textColor: "text-gray-400"
    },
    {
      id: 2,
      name: "REALME",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/100/150",
      discount: "UP to 80% OFF",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      id: 3,
      name: "XIAOMI",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/100/150",
      discount: "UP to 80% OFF",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="my-6">
        <HeroBanner 
          title="SMART WEARABLE."
          subtitle="Best Deal Online on smart watches"
          discount="UP to 80% OFF"
          image="/api/placeholder/300/300"
        />
      </div>
      
      <div className="my-8">
        <ProductGrid 
          title="Grab the best deal on"
          highlightedText="Smartphones"
          products={smartphones}
        />
      </div>
      
      <div className="my-8">
        <CategoryGrid 
          title="Shop From"
          highlightedText="Top Categories"
          categories={categories}
        />
      </div>
      
      <div className="my-8">
        <BrandCarousel 
          title="Top"
          highlightedText="Electronics Brands"
          brands={brands}
        />
      </div>
    </div>
  );
};

export default HomePage;