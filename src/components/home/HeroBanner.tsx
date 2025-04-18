import React, { useState } from 'react';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  discount?: string;
  image?: string;
  ctaText?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  title = "SMART WEARABLE",
  subtitle = "Best Deal Online on smart watches",
  discount = "UP to 80% OFF",
  image = "https://unsplash.com/photos/black-chronograph-watch-V2owNGx837Q",
  ctaText = "Shop Now"
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  return (
    <div className="relative bg-gradient-to-r from-sky-800 to-sky-900 rounded-xl overflow-hidden mb-8 shadow-lg">
      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left text-sky-700 text-lg"></i>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500"
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right text-sky-700 text-lg"></i>
      </button>
      
      <div className="flex flex-col md:flex-row p-6 md:p-10 lg:p-12">
        <div className="w-full md:w-3/5 text-white order-2 md:order-1">
          <p className="text-sm md:text-base font-medium mb-1 text-sky-200 animate-fadeIn">
            {subtitle}
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 animate-fadeIn delay-100">
            {title}
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-sky-100 mb-4 md:mb-6 animate-fadeIn delay-200">
            {discount}
          </p>
          
          <button 
            className="px-6 py-2.5 bg-white text-sky-700 font-semibold rounded-lg hover:bg-sky-100 transition-all duration-300 hover:shadow-md animate-fadeIn delay-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-800"
          >
            {ctaText}
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
          
          {/* Banner navigation dots */}
          <div className="mt-6 md:mt-8 flex space-x-2 animate-fadeIn delay-400">
            {Array(totalSlides).fill(0).map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-sky-500/50 hover:bg-sky-400'}`}
                aria-label={`Go to slide ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-2/5 flex justify-center items-center order-1 md:order-2 mb-4 md:mb-0">
          <img 
            src={image} 
            alt={title} 
            className="max-h-40 md:max-h-56 lg:max-h-64 object-contain animate-fadeIn delay-200 hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;