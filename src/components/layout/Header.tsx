// src/components/layout/Header.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import CartDropdown from "../cart/CartDropdown";

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { 
    itemCount, 
    isCartDropdownOpen, 
    toggleCartDropdown, 
    closeCartDropdown,
    cartItems,
    updateQuantity,
    removeItem 
  } = useCart();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    } else {
      // Navigate to account page instead of opening modal
      navigate('/account');
    }
  };

  const closeDropdown = () => {
    setIsAccountDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeDropdown();
    navigate('/');
  };

  const navigateToAccount = () => {
    if (isAuthenticated) {
      if (user?.isStaff) {
        navigate('/dashboard');
      } else {
        navigate('/account');
      }
    } else {
      navigate('/account');
    }
    closeDropdown();
  };

  // Get display name based on available user information
  const getDisplayName = () => {
    if (user) {
      if (user.firstName) return user.firstName;
      if (user.username) return user.username;
      if (user.email) return user.email.split('@')[0];
      return 'User';
    }
    return 'Guest';
  };

  return (
    <header className="bg-white shadow-md py-2 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-sky-600">Fast</span>
              <span className="text-2xl font-bold text-sky-800">Shopping</span>
            </Link>
          </div>

          {/* Search - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex flex-grow mx-10 max-w-2xl relative">
            <div className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                />
                <button className="absolute right-0 top-0 h-full px-4 text-sky-600 rounded-r-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile search button */}
            <button
              className="md:hidden text-sky-700 hover:text-sky-900 transition-colors duration-200"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <i className="fas fa-search text-xl"></i>
            </button>

            {/* User account with login/account page link and dropdown */}
            <div className="relative">
              <button
                onClick={handleAccountClick}
                onBlur={() => setTimeout(closeDropdown, 200)}
                className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200"
                aria-label={isAuthenticated ? "My Account" : "Login"}
              >
                <div className="relative">
                  <i className="fas fa-user text-xl group-hover:scale-110 transition-transform duration-200"></i>
                  {isAuthenticated && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-xs hidden sm:inline mt-1">
                  {isAuthenticated ? "Account" : "Login"}
                </span>
              </button>

              {/* Authenticated user dropdown */}
              {isAuthenticated && isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">Hi, {getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={navigateToAccount}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                  >
                    <i className="fas fa-user-circle mr-2"></i> 
                    {user?.isStaff ? 'Dashboard' : 'My Account'}
                  </button>
                  
                  {!user?.isStaff && (
                    <>
                      <Link
                        to="/account?tab=orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-shopping-bag mr-2"></i> My Orders
                      </Link>
                      
                      <Link
                        to="/account?tab=wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-heart mr-2"></i> Wishlist
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/account?tab=wishlist"
              className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200"
              aria-label="Wishlist"
            >
              <div className="relative">
                <i className="fas fa-heart text-xl group-hover:scale-110 transition-transform duration-200"></i>
              </div>
              <span className="text-xs hidden sm:inline mt-1">Wishlist</span>
            </Link>

            {/* Cart */}
            <div className="relative">
              <button
                onClick={toggleCartDropdown}
                className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200 relative"
                aria-label="Cart"
              >
                <div className="relative">
                  <i className="fas fa-shopping-cart text-xl group-hover:scale-110 transition-transform duration-200"></i>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs hidden sm:inline mt-1">Cart</span>
              </button>
              
              {/* Cart Dropdown */}
              <CartDropdown 
                isOpen={isCartDropdownOpen}
                onClose={closeCartDropdown}
                cartItems={cartItems}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            </div>
          </div>
        </div>

        {/* Mobile search - only visible when toggled */}
        {isSearchOpen && (
          <div className="mt-3 md:hidden">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-sky-600 rounded-r-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;