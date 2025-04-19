import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parentId: number | null;
  level: number;
  path: string;
  isActive: boolean;
  order: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  children: Category[];
}

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/categories/tree`);
        setCategories(response.data.data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Flatten categories for the main navigation (only top-level categories)
  const topLevelCategories = categories.filter(cat => cat.level === 0).slice(0, 6);

  // Improved hover handling with delays
  const handleCategoryHover = (categoryId: number | null) => {
    if (categoryId !== null) {
      setActiveSubmenu(categoryId);
    } else {
      setTimeout(() => {
        setActiveSubmenu(null);
      }, 200); // Small delay to allow moving to submenu
    }
  };

  // Render category tree recursively for dropdown
  const renderCategoryTree = (category: Category) => {
    return (
      <div 
        key={category.id}
        className="relative"
        onMouseEnter={() => handleCategoryHover(category.id)}
        onMouseLeave={() => handleCategoryHover(null)}
      >
        <Link
          to={`/category/${category.slug}`}
          className="flex items-center justify-between px-4 py-2.5 text-sky-800 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
        >
          <div className="flex items-center">
            {category.image && (
              <img 
                src={category.image} 
                alt={category.name}
                className="w-6 h-6 rounded-full object-cover mr-3"
              />
            )}
            <span>{category.name}</span>
          </div>
          {category.children.length > 0 && (
            <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>
        
        {category.children.length > 0 && activeSubmenu === category.id && (
          <div 
            className="absolute left-full top-0 ml-1 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 animate-fadeIn"
            onMouseEnter={() => handleCategoryHover(category.id)}
            onMouseLeave={() => handleCategoryHover(null)}
          >
            {category.children.map(child => renderCategoryTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-sky-700 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* All Categories Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
            onMouseLeave={() => {
              setIsCategoriesDropdownOpen(false);
              setActiveSubmenu(null);
            }}
          >
            <button className="flex items-center space-x-2 py-3 px-4 font-medium hover:bg-sky-800 transition-colors duration-200 rounded-lg">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>All Categories</span>
              <svg className={`h-4 w-4 ml-1 transform transition-transform ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown content */}
            {isCategoriesDropdownOpen && (
              <div className="absolute left-0 top-full w-64 bg-white shadow-lg rounded-md z-50 animate-fadeIn">
                {isLoading ? (
                  <div className="py-4 px-4 text-center text-gray-500">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading categories...
                  </div>
                ) : error ? (
                  <div className="py-4 px-4 text-center text-red-500">
                    {error}
                  </div>
                ) : categories.length > 0 ? (
                  <ul className="py-2">
                    {categories.map(category => (
                      <li key={category.id}>
                        {renderCategoryTree(category)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-4 px-4 text-center text-gray-500">
                    No categories found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Main Navigation Categories */}
          <ul className="flex items-center space-x-1">
            {topLevelCategories.map((category) => (
              <li key={category.id}>
                <Link 
                  to={`/category/${category.slug}`} 
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
            {isLoading ? (
              <div className="py-4 px-4 text-center text-white">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading categories...
              </div>
            ) : error ? (
              <div className="py-4 px-4 text-center text-red-300">
                {error}
              </div>
            ) : categories.length > 0 ? (
              <ul className="py-2">
                {categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <li>
                      <Link 
                        to={`/category/${category.slug}`} 
                        className="flex items-center px-4 py-3 hover:bg-sky-700 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.image && (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-6 h-6 rounded-full object-cover mr-3"
                          />
                        )}
                        {category.name}
                      </Link>
                    </li>
                    {category.children.length > 0 && (
                      <div className="pl-8">
                        {category.children.map(child => (
                          <li key={child.id}>
                            <Link 
                              to={`/category/${child.slug}`} 
                              className="flex items-center px-4 py-3 hover:bg-sky-700 transition-colors duration-200"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.image && (
                                <img 
                                  src={child.image} 
                                  alt={child.name}
                                  className="w-5 h-5 rounded-full object-cover mr-3"
                                />
                              )}
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            ) : (
              <div className="py-4 px-4 text-center text-white">
                No categories found
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;