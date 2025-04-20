import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [activeSubmenus, setActiveSubmenus] = useState<Record<number, boolean>>({});
  const [isMenuInteracting, setIsMenuInteracting] = useState(false);
  
  // Refs for dropdown elements
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/categories/tree`);
        if (response.data?.data?.categories) {
          setCategories(response.data.data.categories);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        setError(err.response?.data?.message || "Failed to load categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle clicks outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        closeAllDropdowns();
      }
    };

    if (isCategoriesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoriesDropdownOpen]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setIsCategoriesDropdownOpen(false);
    setActiveSubmenus({});
    setIsMenuInteracting(false);
  }, []);

  // Flatten categories for the main navigation (only top-level categories)
  const topLevelCategories = categories
    .filter(cat => cat.level === 0 && cat.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  // Toggle submenu state
  const toggleSubmenu = useCallback((categoryId: number, isOpen: boolean) => {
    setActiveSubmenus(prev => ({
      ...prev,
      [categoryId]: isOpen
    }));
  }, []);

  // Handle mouse enter for submenu
  const handleSubmenuMouseEnter = useCallback((categoryId: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsMenuInteracting(true);
    toggleSubmenu(categoryId, true);
  }, [toggleSubmenu]);

  // Handle mouse leave for submenu with delay
  const handleSubmenuMouseLeave = useCallback((categoryId: number) => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isMenuInteracting) {
        toggleSubmenu(categoryId, false);
      }
    }, 200);
  }, [isMenuInteracting, toggleSubmenu]);

  // Toggle the main categories dropdown
  const toggleCategoriesDropdown = useCallback(() => {
    setIsCategoriesDropdownOpen(prev => !prev);
    if (!isCategoriesDropdownOpen) {
      setActiveSubmenus({});
    }
  }, [isCategoriesDropdownOpen]);

  // Handle category dropdown mouse enter
  const handleCategoriesMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsMenuInteracting(true);
    setIsCategoriesDropdownOpen(true);
  }, []);

  // Handle category dropdown mouse leave
  const handleCategoriesMouseLeave = useCallback(() => {
    setIsMenuInteracting(false);
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isMenuInteracting) {
        closeAllDropdowns();
      }
    }, 300);
  }, [isMenuInteracting, closeAllDropdowns]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    if (isMobileMenuOpen) {
      setActiveSubmenus({});
    }
  }, [isMobileMenuOpen]);

  // Toggle submenu for mobile view
  const toggleMobileSubmenu = useCallback((e: React.MouseEvent, categoryId: number) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSubmenu(categoryId, !activeSubmenus[categoryId]);
  }, [activeSubmenus, toggleSubmenu]);

  // Handle category click - close dropdowns
  const handleCategoryClick = useCallback(() => {
    closeAllDropdowns();
    setIsMobileMenuOpen(false);
  }, [closeAllDropdowns]);

  // Render category tree recursively for dropdown
  const renderCategoryTree = (category: Category, level = 0) => {
    if (!category.isActive) return null;
    
    const hasChildren = category.children && category.children.length > 0;
    const isSubmenuOpen = activeSubmenus[category.id] || false;
    
    return (
      <div 
        key={category.id}
        className={`relative group ${level > 0 ? 'w-full' : ''}`}
        onMouseEnter={() => handleSubmenuMouseEnter(category.id)}
        onMouseLeave={() => handleSubmenuMouseLeave(category.id)}
      >
        <div 
          className={`flex items-center justify-between px-4 py-2.5 text-sky-800 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200 cursor-pointer ${
            isSubmenuOpen ? 'bg-sky-50 text-sky-600' : ''
          }`}
        >
          <Link
            to={`/products?category=${category.slug}`}
            className="flex items-center flex-grow"
            onClick={handleCategoryClick}
          >
            {category.image && (
              <img 
                src={category.image} 
                alt=""
                aria-hidden="true"
                className="w-6 h-6 rounded-full object-cover mr-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span>{category.name}</span>
          </Link>
          {hasChildren && (
            <span className="px-2 py-1">
              <svg 
                className={`w-4 h-4 ml-2 text-gray-400 transform transition-transform ${isSubmenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
        
        {hasChildren && isSubmenuOpen && (
          <div 
            className={`absolute ${level === 0 ? 'left-full top-0' : 'left-full top-0'} ml-1 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100`}
            style={{ animation: 'fadeIn 0.2s ease-in-out forwards' }}
          >
            {category.children
              .filter(child => child.isActive)
              .sort((a, b) => a.order - b.order)
              .map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-sky-700 text-white" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between">
          {/* All Categories Dropdown */}
          <div 
            ref={categoriesDropdownRef}
            className="relative"
            onMouseEnter={handleCategoriesMouseEnter}
            onMouseLeave={handleCategoriesMouseLeave}
          >
            <button 
              className={`flex items-center space-x-2 py-3 px-4 font-medium ${
                isCategoriesDropdownOpen ? 'bg-sky-800' : 'hover:bg-sky-800'
              } transition-colors duration-200 rounded-lg`}
              onClick={toggleCategoriesDropdown}
              aria-expanded={isCategoriesDropdownOpen}
              aria-haspopup="true"
              aria-controls="categories-dropdown"
            >
              <svg 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>All Categories</span>
              <svg 
                className={`h-4 w-4 ml-1 transform transition-transform duration-200 ${
                  isCategoriesDropdownOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown content */}
            {isCategoriesDropdownOpen && (
              <div 
                id="categories-dropdown"
                className="absolute left-0 top-full mt-1 w-64 bg-white shadow-lg rounded-md z-50"
                onMouseEnter={handleCategoriesMouseEnter}
                onMouseLeave={handleCategoriesMouseLeave}
                style={{ animation: 'fadeIn 0.2s ease-in-out forwards' }}
              >
                {isLoading ? (
                  <div className="py-4 px-4 text-center text-gray-500">
                    <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading categories...
                  </div>
                ) : error ? (
                  <div className="py-4 px-4 text-center text-red-500">
                    <svg className="h-5 w-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </div>
                ) : categories.length > 0 ? (
                  <ul className="py-2">
                    {categories
                      .filter(category => category.level === 0 && category.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map(category => (
                        <li key={category.id}>
                          {renderCategoryTree(category)}
                        </li>
                      ))
                    }
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
                  to={`/products?category=${category.slug}`} 
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
            <svg 
              className="h-5 w-5 text-yellow-400 inline mr-1.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
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
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-menu"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
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
            <svg 
              className="h-5 w-5 text-yellow-400 mr-1.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="font-semibold">Deals</span>
          </Link>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden bg-sky-800 rounded-lg mt-1 shadow-lg overflow-y-auto max-h-[80vh]"
            style={{ animation: 'fadeIn 0.2s ease-in-out forwards' }}
          >
            {isLoading ? (
              <div className="py-4 px-4 text-center text-white">
                <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading categories...
              </div>
            ) : error ? (
              <div className="py-4 px-4 text-center text-red-300">
                {error}
              </div>
            ) : categories.length > 0 ? (
              <ul className="py-2">
                {categories
                  .filter(category => category.level === 0 && category.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((category) => (
                    <React.Fragment key={category.id}>
                      <li>
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-sky-700 transition-colors duration-200">
                          <Link 
                            to={`/category/${category.slug}`} 
                            className="flex-grow flex items-center"
                            onClick={handleCategoryClick}
                          >
                            {category.image && (
                              <img 
                                src={category.image} 
                                alt=""
                                aria-hidden="true"
                                className="w-6 h-6 rounded-full object-cover mr-3"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <span>{category.name}</span>
                          </Link>
                          {category.children && category.children.length > 0 && (
                            <button
                              className="p-2 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-md"
                              aria-expanded={activeSubmenus[category.id]}
                              aria-label={`Toggle ${category.name} submenu`}
                              onClick={(e) => toggleMobileSubmenu(e, category.id)}
                            >
                              <svg 
                                className={`w-4 h-4 text-sky-300 transform transition-transform duration-200 ${
                                  activeSubmenus[category.id] ? 'rotate-90' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </li>
                      {category.children && category.children.length > 0 && activeSubmenus[category.id] && (
                        <div 
                          className="pl-8 bg-sky-900"
                          style={{ animation: 'fadeIn 0.2s ease-in-out forwards' }}
                        >
                          {category.children
                            .filter(child => child.isActive)
                            .sort((a, b) => a.order - b.order)
                            .map(child => (
                              <li key={child.id}>
                                <Link 
                                  to={`/category/${child.slug}`} 
                                  className="flex items-center px-4 py-3 hover:bg-sky-700 transition-colors duration-200"
                                  onClick={handleCategoryClick}
                                >
                                  {child.image && (
                                    <img 
                                      src={child.image} 
                                      alt=""
                                      aria-hidden="true"
                                      className="w-5 h-5 rounded-full object-cover mr-3"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {child.name}
                                </Link>
                              </li>
                            ))
                          }
                        </div>
                      )}
                    </React.Fragment>
                  ))
                }
              </ul>
            ) : (
              <div className="py-4 px-4 text-center text-white">
                No categories found
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;