import React, { useState } from 'react';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sample categories
  const categories = [
    { id: 1, name: 'Electronics', link: '#' },
    { id: 2, name: 'Smartphones', link: '#' },
    { id: 3, name: 'Computers', link: '#' },
    { id: 4, name: 'Accessories', link: '#' },
    { id: 5, name: 'Appliances', link: '#' },
    { id: 6, name: 'Fashion', link: '#' },
    { id: 7, name: 'Home & Kitchen', link: '#' },
    { id: 8, name: 'Beauty', link: '#' },
  ];

  return (
    <nav className="bg-sky-700 text-white">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* All Categories Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 py-3.5 px-4 font-medium hover:bg-sky-800 transition-colors duration-200">
              <i className="fas fa-bars"></i>
              <span>All Categories</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>
            
            {/* Dropdown content */}
            <div className="absolute left-0 top-full w-64 bg-white shadow-lg rounded-b-md z-50 hidden group-hover:block">
              <ul className="py-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <a 
                      href={category.link} 
                      className="block px-4 py-2.5 text-sky-800 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Main Navigation Categories */}
          <ul className="flex items-center">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <a 
                  href={category.link} 
                  className="block py-3.5 px-4 font-medium hover:bg-sky-800 transition-colors duration-200"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
          
          {/* Hot Deals Link */}
          <a 
            href="#" 
            className="block py-3.5 px-4 font-medium text-sky-100 hover:bg-sky-800 transition-colors duration-200"
          >
            <i className="fas fa-fire-alt mr-1.5 text-yellow-400"></i>
            Hot Deals
          </a>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-2.5">
          <button 
            className="flex items-center space-x-2 py-2 px-2 font-medium"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            <span>{isMobileMenuOpen ? 'Close' : 'Categories'}</span>
          </button>
          
          {/* Hot Deals Link for Mobile */}
          <a 
            href="#" 
            className="flex items-center py-2 px-2 font-medium text-sky-100"
          >
            <i className="fas fa-fire-alt mr-1.5 text-yellow-400"></i>
            Hot Deals
          </a>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <ul className="pb-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <a 
                    href={category.link} 
                    className="block px-4 py-2.5 hover:bg-sky-800 transition-colors duration-200 border-b border-sky-600 last:border-0"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;