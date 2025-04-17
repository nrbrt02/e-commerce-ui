import React from 'react';
import ProductCard from '../ui/ProductCard';

interface Product {
  id: number;
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  savings: number;
}

interface ProductGridProps {
  title: string;
  highlightedText: string;
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  title = "Smartphone", 
  highlightedText = "Deals", 
  products = [
    {
      id: 1,
      name: "Samsung Galaxy S22 Ultra 5G (Phantom Black, 12GB RAM, 256GB)",
      image: "/api/placeholder/200/200",
      currentPrice: 999.99,
      originalPrice: 1199.99,
      discount: 16,
      savings: 200.00
    },
    {
      id: 2,
      name: "Apple iPhone 15 Pro (Deep Blue, 256GB)",
      image: "/api/placeholder/200/200",
      currentPrice: 1099.99,
      originalPrice: 1299.99,
      discount: 15,
      savings: 200.00
    },
    {
      id: 3,
      name: "Google Pixel 7 Pro (Snow, 12GB RAM, 128GB)",
      image: "/api/placeholder/200/200",
      currentPrice: 899.99,
      originalPrice: 999.99,
      discount: 10,
      savings: 100.00
    },
    {
      id: 4,
      name: "OnePlus 11 5G (Eternal Green, 8GB RAM, 128GB)",
      image: "/api/placeholder/200/200",
      currentPrice: 799.99,
      originalPrice: 899.99,
      discount: 11,
      savings: 100.00
    },
    {
      id: 5,
      name: "Xiaomi 14 Ultra (Titanium, 12GB RAM, 256GB)",
      image: "/api/placeholder/200/200",
      currentPrice: 899.99,
      originalPrice: 1099.99,
      discount: 18,
      savings: 200.00
    }
  ]
}) => {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {title} <span className="text-sky-600">{highlightedText}</span>
        </h2>
        <a href="#" className="text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 flex items-center font-medium">
          View All <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </a>
      </div>
      <div className="border-b-2 border-sky-500 w-40 mb-6"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            image={product.image}
            currentPrice={product.currentPrice}
            originalPrice={product.originalPrice}
            discount={product.discount}
            savings={product.savings}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;