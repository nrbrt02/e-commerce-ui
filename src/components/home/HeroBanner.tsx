import React from 'react';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  discount: string;
  image: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title = "SMART WEARABLE",
  subtitle = "Best Deal Online on smart watches",
  discount = "UP to 80% OFF",
  image = "/api/placeholder/300/300"
}) => {
  return (
    <div className="relative bg-gradient-to-r from-sky-800 to-sky-900 rounded-lg overflow-hidden mb-8">
      <div className="absolute left-0 top-0 bottom-0 flex items-center">
        <button className="bg-white p-2 rounded-full ml-2 shadow-md hover:bg-sky-50 transition-colors duration-200">
          <i className="fas fa-chevron-left text-sky-700"></i>
        </button>
      </div>
      <div className="absolute right-0 top-0 bottom-0 flex items-center">
        <button className="bg-white p-2 rounded-full mr-2 shadow-md hover:bg-sky-50 transition-colors duration-200">
          <i className="fas fa-chevron-right text-sky-700"></i>
        </button>
      </div>
      
      <div className="flex p-8 md:p-12">
        <div className="w-3/5 text-white">
          <h3 className="text-lg md:text-xl font-medium mb-2">{subtitle}</h3>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{title}</h2>
          <p className="text-xl md:text-2xl font-bold text-sky-200">{discount}</p>
          
          <button className="mt-4 px-6 py-2 bg-white text-sky-700 font-medium rounded-md hover:bg-sky-100 transition-colors duration-200">
            Shop Now
          </button>
          
          {/* Banner navigation dots */}
          <div className="mt-8 flex space-x-1.5">
            {Array(5).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-${i === 0 ? '6' : '2'} ${i === 0 ? 'bg-white' : 'bg-sky-500/50'} rounded-full`}
              ></div>
            ))}
          </div>
        </div>
        <div className="w-2/5 flex justify-center items-center">
          <img 
            src={image} 
            alt={title} 
            className="max-h-48 md:max-h-64 object-contain animate-fadeIn"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;