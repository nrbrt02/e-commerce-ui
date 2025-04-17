import React, { useState } from "react";

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  return (
    <header className="bg-white shadow-md py-4 px-4 lg:px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold text-sky-600">Fast</span>
              <span className="text-2xl font-bold text-sky-800">Shopping</span>
            </a>
          </div>

          {/* Search - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex flex-grow mx-10 max-w-2xl relative">
            <div className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
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

            {/* User account */}
            <a
              href="/account"
              className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200"
              aria-label="Account"
            >
              <div className="relative">
                <i className="fas fa-user text-xl group-hover:scale-110 transition-transform duration-200"></i>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full hidden"></span>
              </div>
              <span className="text-xs hidden sm:inline mt-1">Account</span>
            </a>

            {/* Wishlist */}
            <a
              href="/wishlist"
              className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200"
              aria-label="Wishlist"
            >
              <div className="relative">
                <i className="fas fa-heart text-xl group-hover:scale-110 transition-transform duration-200"></i>
                {/* Add counter for wishlist items here if needed */}
              </div>
              <span className="text-xs hidden sm:inline mt-1">Wishlist</span>
            </a>

            {/* Cart */}
            <a
              href="/cart"
              className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200 relative"
              aria-label="Cart"
            >
              <div className="relative">
                <i className="fas fa-shopping-cart text-xl group-hover:scale-110 transition-transform duration-200"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden sm:inline mt-1">Cart</span>
            </a>
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
