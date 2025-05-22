import React, { useState, useEffect, KeyboardEvent, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useSearch } from "../../context/SearchContext";
import CartDropdown from "../cart/CartDropdown";
import { Search, User, Heart, ShoppingCart, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout, openAuthModal } = useAuth();
  const {
    itemCount,
    isCartDropdownOpen,
    toggleCartDropdown,
    closeCartDropdown,
    cartItems,
    updateQuantity,
    removeItem,
  } = useCart();

  const { query, setQuery, performSearch, loading, error, clearErrors } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [userHasTyped, setUserHasTyped] = useState(false);
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const currentPathname = location.pathname;
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = currentPathname;
    
    if (currentPathname === "/search" && prevPathname !== "/search") {
      const params = new URLSearchParams(location.search);
      const queryParam = params.get("query");
      if (queryParam) {
        setQuery(queryParam);
      }
    }
  }, [location.pathname, location.search, setQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear any existing error when user starts typing
    if (error) {
      clearErrors();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log('Search form submitted with query:', query);
      performSearch();
    } else {
      console.log('Empty search query, submission ignored');
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        console.log('Search triggered by Enter key with query:', query);
        performSearch();
      } else {
        console.log('Empty search query, Enter key ignored');
      }
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/account';
    if (user.role === 'superAdmin' || user.primaryRole === 'superAdmin') {
      return '/dashboard';
    } else if (user.role === 'admin' || user.primaryRole === 'admin') {
      return '/dashboard';
    } else if (user.role === 'supplier' || user.primaryRole === 'supplier') {
      return '/dashboard';
    }
    return '/account';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Account';
    if (user.role === 'superAdmin' || user.primaryRole === 'superAdmin') {
      return 'Admin Dashboard';
    } else if (user.role === 'admin' || user.primaryRole === 'admin') {
      return 'Admin Dashboard';
    } else if (user.role === 'supplier' || user.primaryRole === 'supplier') {
      return 'Supplier Portal';
    }
    return 'My Account';
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    } else {
      openAuthModal('login', 'customer');
    }
  };

  const closeDropdown = () => {
    setIsAccountDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeDropdown();
  };

  const navigateToAccount = () => {
    if (isAuthenticated) {
      navigate(getDashboardPath());
    } else {
      openAuthModal('login', 'customer');
    }
    closeDropdown();
  };

  const getDisplayName = () => {
    if (user) {
      if (user.firstName) return user.firstName;
      if (user.username) return user.username;
      if (user.email) return user.email.split("@")[0];
      return "User";
    }
    return "Guest";
  };

  return (
    <header className="bg-white shadow-md py-2 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-sky-600">Fast</span>
              <span className="text-2xl font-bold text-sky-800">Shopping</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-grow mx-10 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-sky-600 rounded-r-lg bg-sky-100 hover:bg-sky-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !query.trim()}
                  aria-label={loading ? "Searching..." : "Search"}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
                  ) : (
                    <Search size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              className="md:hidden text-sky-700 hover:text-sky-900 transition-colors duration-200"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>

            <div className="relative">
              <button
                onClick={handleAccountClick}
                onBlur={() => setTimeout(closeDropdown, 200)}
                className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200"
                aria-label={isAuthenticated ? "My Account" : "Login"}
              >
                <div className="relative">
                  <User size={20} />
                  {isAuthenticated && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-xs hidden sm:inline mt-1">
                  {isAuthenticated ? "Account" : "Login"}
                </span>
              </button>

              {isAuthenticated && isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">Hi, {getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={navigateToAccount}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                  >
                    <User size={16} className="mr-2" />
                    {getDashboardLabel()}
                  </button>

                  {!(user?.isStaff) && (
                    <>
                      <Link
                        to="/account?tab=orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                        onClick={closeDropdown}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        My Orders
                      </Link>

                      <Link
                        to="/account?tab=wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                        onClick={closeDropdown}
                      >
                        <Heart size={16} className="mr-2" />
                        Wishlist
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/account?tab=wishlist"
              className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart size={20} />
              </div>
              <span className="text-xs hidden sm:inline mt-1">Wishlist</span>
            </Link>

            <div className="relative">
              <button
                onClick={toggleCartDropdown}
                className="group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200 relative"
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs hidden sm:inline mt-1">Cart</span>
              </button>

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

        {isSearchOpen && (
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative w-full">
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-sky-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-sky-600 rounded-r-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200"
                  disabled={loading || !query.trim()}
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;