import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Sample categories - you can modify these as needed
  const categories = [
    { id: 1, name: 'Electronics', path: '/category/electronics', icon: '🖥️' },
    { id: 2, name: 'Smartphones', path: '/category/smartphones', icon: '📱' },
    { id: 3, name: 'Computers', path: '/category/computers', icon: '💻' },
    { id: 4, name: 'Accessories', path: '/category/accessories', icon: '🎧' },
    { id: 5, name: 'Appliances', path: '/category/appliances', icon: '🧺' },
    { id: 6, name: 'Fashion', path: '/category/fashion', icon: '👕' },
    { id: 7, name: 'Home & Kitchen', path: '/category/home-kitchen', icon: '🏠' },
    { id: 8, name: 'Beauty', path: '/category/beauty', icon: '💄' },
  ];

  return (
    <nav className="bg-sky-700 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* All Categories Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 py-3 px-4 font-medium hover:bg-sky-800 transition-colors duration-200 rounded-lg">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>All Categories</span>
              <svg className="h-4 w-4 ml-1 transform group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown content */}
            <div className="absolute left-0 top-full w-64 bg-white shadow-lg rounded-md z-50 hidden group-hover:block animate-fadeIn">
              <ul className="py-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={category.path} 
                      className="flex items-center px-4 py-2.5 text-sky-800 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Main Navigation Categories */}
          <ul className="flex items-center space-x-1">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link 
                  to={category.path} 
                  className="block py-3 px-4 font-medium hover:bg-sky-800 transition-colors duration-200 rounded-lg"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Hot Deals Link */}
          <Link 
            to="/deals" 
            className="flex items-center py-3 px-4 font-medium text-white bg-sky-800 hover:bg-sky-900 transition-colors duration-200 rounded-lg"
          >
            <svg className="h-5 w-5 text-yellow-400 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="font-semibold">Hot Deals</span>
          </Link>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-2">
          <button 
            className="flex items-center space-x-2 py-2 px-3 font-medium hover:bg-sky-800 rounded-lg transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            <span>{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
          </button>
          
          {/* Hot Deals Link for Mobile */}
          <Link 
            to="/deals" 
            className="flex items-center py-2 px-3 font-medium text-white bg-sky-800 hover:bg-sky-900 rounded-lg transition-colors duration-200"
          >
            <svg className="h-5 w-5 text-yellow-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="font-semibold">Deals</span>
          </Link>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-sky-800 rounded-lg mt-1 shadow-lg animate-fadeIn">
            <ul className="py-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={category.path} 
                    className="flex items-center px-4 py-3 hover:bg-sky-700 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{category.icon}</span>
                    {category.name}
                  </Link>
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