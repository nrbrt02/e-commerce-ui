import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TopBar: React.FC = () => {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const selectLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    setIsLanguageDropdownOpen(false);
    // Here you would typically also implement language change logic
  };

  return (
    <div className="bg-sky-700 text-white">
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            {/* Contact information */}
            <div className="flex items-center">
              <svg 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                />
              </svg>
              <span>+ 250 780 000 000</span>
            </div>
            
            <div className="hidden md:flex items-center">
              <svg 
                className="h-4 w-4 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              <span>support@fastshopping.com</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* FAQ */}
            <Link to="/faq" className="hover:text-sky-200 transition-colors duration-200">
              FAQ
            </Link>
            
            {/* Language selector */}
            <div className="relative">
              <button 
                onClick={toggleLanguageDropdown}
                className="flex items-center hover:text-sky-200 transition-colors duration-200 focus:outline-none"
              >
                <span className="mr-1">{currentLanguage}</span>
                <svg 
                  className={`h-4 w-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-20 bg-white text-gray-800 rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => selectLanguage('EN')}
                    className="block w-full text-left px-4 py-1 hover:bg-sky-100"
                  >
                    English
                  </button>
                  <button
                    onClick={() => selectLanguage('FR')}
                    className="block w-full text-left px-4 py-1 hover:bg-sky-100"
                  >
                    Français
                  </button>
                  <button
                    onClick={() => selectLanguage('ES')}
                    className="block w-full text-left px-4 py-1 hover:bg-sky-100"
                  >
                    Español
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;