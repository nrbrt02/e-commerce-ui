import React from 'react';

interface Brand {
  id: number;
  name: string;
  discount: string;
  logo: string;
  image: string;
  bgColor: string;
  textColor: string;
}

interface BrandCarouselProps {
  title: string;
  highlightedText: string;
  brands: Brand[];
}

const BrandCarousel: React.FC<BrandCarouselProps> = ({ 
  title = "Popular", 
  highlightedText = "Brands", 
  brands = [
    {
      id: 1,
      name: "SAMSUNG",
      discount: "Up to 45% OFF",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/150/150",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      id: 2,
      name: "APPLE",
      discount: "Up to 25% OFF",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/150/150",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    },
    {
      id: 3,
      name: "SONY",
      discount: "Up to 35% OFF",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/150/150",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      id: 4,
      name: "MICROSOFT",
      discount: "Up to 30% OFF",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/150/150",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      id: 5,
      name: "HP",
      discount: "Up to 40% OFF",
      logo: "/api/placeholder/30/30",
      image: "/api/placeholder/150/150",
      bgColor: "bg-sky-50",
      textColor: "text-sky-600"
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
      
      <div className="relative">
        {/* Left scroll arrow */}
        <button className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center text-sky-600 hover:bg-sky-50 transition-colors duration-200">
          <i className="fas fa-chevron-left"></i>
        </button>
        
        {/* Right scroll arrow */}
        <button className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center text-sky-600 hover:bg-sky-50 transition-colors duration-200">
          <i className="fas fa-chevron-right"></i>
        </button>
        
        {/* Carousel container */}
        <div className="carousel-container flex space-x-4 overflow-x-auto pb-4 px-2">
          {brands.map((brand) => (
            <div 
              key={brand.id}
              className={`carousel-item flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 rounded-lg overflow-hidden border border-gray-200 ${brand.bgColor}`}
            >
              <div className="p-6 flex">
                <div className="w-1/2">
                  <h3 className={`text-sm font-bold ${brand.textColor} uppercase`}>{brand.name}</h3>
                  <div className="mt-2 w-12 h-12 bg-white rounded-md flex items-center justify-center shadow-sm">
                    <img src={brand.logo} alt={brand.name} className="w-6 h-6" />
                  </div>
                  <p className="mt-4 font-bold text-gray-800">{brand.discount}</p>
                  <button className="mt-2 px-3 py-1 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 transition-colors duration-200">
                    Shop Now
                  </button>
                </div>
                <div className="w-1/2 flex items-center justify-center">
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="h-32 object-contain transform transition-transform duration-300 hover:scale-110" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Carousel navigation dots */}
      <div className="flex justify-center mt-4 space-x-1.5">
        <div className="h-2 w-8 bg-sky-500 rounded-full"></div>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-2 w-2 bg-gray-300 rounded-full"></div>
        ))}
      </div>
    </section>
  );
};

export default BrandCarousel;