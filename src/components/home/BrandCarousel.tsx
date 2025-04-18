import React from 'react';
import { Link } from 'react-router-dom';

interface Brand {
  id: number;
  name: string;
  logo: string;
  image: string;
  discount: string;
  bgColor: string;
  textColor: string;
}

interface BrandCarouselProps {
  title: string;
  highlightedText: string;
  brands: Brand[];
}

const BrandCarousel: React.FC<BrandCarouselProps> = ({ title, highlightedText, brands }) => {
  return (
    <div>
      {/* Section Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {title} <span className="text-sky-600">{highlightedText}</span>
        </h2>
        <Link to="/brands" className="text-sky-600 hover:text-sky-700 font-medium flex items-center">
          View All
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Brands Carousel */}
      <div className="relative">
        {/* Navigation arrows */}
        <button className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
          <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
          <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Brands grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6">
          {brands.map((brand) => (
            <Link 
              key={brand.id}
              to={`/brand/${brand.name.toLowerCase()}`}
              className={`flex items-center rounded-lg overflow-hidden shadow-md ${brand.bgColor}`}
            >
              <div className="flex flex-col p-4 flex-1">
                <div className="flex items-center mb-2">
                  <img src={brand.logo} alt={brand.name} className="h-6 w-6 mr-2" />
                  <span className={`text-sm font-bold ${brand.textColor}`}>{brand.name}</span>
                </div>
                <p className={`text-xs ${brand.textColor} mb-2`}>{brand.discount}</p>
                <button className={`text-xs py-1 px-3 rounded-full border ${brand.textColor} border-current`}>
                  Shop Now
                </button>
              </div>
              <div className="w-24 h-32 flex items-center justify-center p-2">
                <img 
                  src={brand.image} 
                  alt={`${brand.name} product`} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCarousel;