import React from 'react';
import { Link } from 'react-router-dom';

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

const ProductGrid: React.FC<ProductGridProps> = ({ title, highlightedText, products }) => {
  return (
    <div>
      {/* Section Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {title} <span className="text-sky-600">{highlightedText}</span>
        </h2>
        <Link to="/products" className="text-sky-600 hover:text-sky-700 font-medium flex items-center">
          View All
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Product Image */}
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-contain p-4"
              />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-sm text-gray-800 font-medium line-clamp-2 mb-2">{product.name}</h3>
              
              <div className="flex items-center mb-1">
                <span className="text-lg font-bold text-gray-800">Rwf{product.currentPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-500 line-through ml-2">Rwf{product.originalPrice.toLocaleString()}</span>
              </div>
              
              <p className="text-xs text-green-600 font-medium">
                You save: Rwf{product.savings.toLocaleString()}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="px-4 pb-4 flex space-x-2">
              <button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded text-sm font-medium">
                Add to Cart
              </button>
              <button className="p-2 border border-gray-300 hover:border-sky-600 rounded">
                <svg className="h-5 w-5 text-gray-600 hover:text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;