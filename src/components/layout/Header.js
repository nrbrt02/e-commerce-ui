import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/layout/Header.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import CartDropdown from "../cart/CartDropdown";
const Header = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const { itemCount, isCartDropdownOpen, toggleCartDropdown, closeCartDropdown, cartItems, updateQuantity, removeItem } = useCart();
    const navigate = useNavigate();
    const handleAccountClick = () => {
        if (isAuthenticated) {
            setIsAccountDropdownOpen(!isAccountDropdownOpen);
        }
        else {
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
            }
            else {
                navigate('/account');
            }
        }
        else {
            navigate('/account');
        }
        closeDropdown();
    };
    // Get display name based on available user information
    const getDisplayName = () => {
        if (user) {
            if (user.firstName)
                return user.firstName;
            if (user.username)
                return user.username;
            if (user.email)
                return user.email.split('@')[0];
            return 'User';
        }
        return 'Guest';
    };
    return (_jsx("header", { className: "bg-white shadow-md py-2 px-4 lg:px-6", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center", children: _jsxs(Link, { to: "/", className: "flex items-center", children: [_jsx("span", { className: "text-2xl font-bold text-sky-600", children: "Fast" }), _jsx("span", { className: "text-2xl font-bold text-sky-800", children: "Shopping" })] }) }), _jsx("div", { className: "hidden md:flex flex-grow mx-10 max-w-2xl relative", children: _jsx("div", { className: "w-full", children: _jsxs("div", { className: "relative w-full", children: [_jsx("input", { type: "text", placeholder: "Search for products, brands and more...", className: "w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition" }), _jsx("button", { className: "absolute right-0 top-0 h-full px-4 text-sky-600 rounded-r-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200", children: _jsx("i", { className: "fas fa-search" }) })] }) }) }), _jsxs("div", { className: "flex items-center gap-4 sm:gap-6", children: [_jsx("button", { className: "md:hidden text-sky-700 hover:text-sky-900 transition-colors duration-200", onClick: () => setIsSearchOpen(!isSearchOpen), "aria-label": "Toggle search", children: _jsx("i", { className: "fas fa-search text-xl" }) }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: handleAccountClick, onBlur: () => setTimeout(closeDropdown, 200), className: "group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200", "aria-label": isAuthenticated ? "My Account" : "Login", children: [_jsxs("div", { className: "relative", children: [_jsx("i", { className: "fas fa-user text-xl group-hover:scale-110 transition-transform duration-200" }), isAuthenticated && (_jsx("span", { className: "absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full" }))] }), _jsx("span", { className: "text-xs hidden sm:inline mt-1", children: isAuthenticated ? "Account" : "Login" })] }), isAuthenticated && isAccountDropdownOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100", children: [_jsxs("div", { className: "px-4 py-2 text-sm text-gray-700 border-b border-gray-100", children: [_jsxs("p", { className: "font-medium", children: ["Hi, ", getDisplayName()] }), _jsx("p", { className: "text-xs text-gray-500", children: user?.email })] }), _jsxs("button", { onClick: navigateToAccount, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200", children: [_jsx("i", { className: "fas fa-user-circle mr-2" }), user?.isStaff ? 'Dashboard' : 'My Account'] }), !user?.isStaff && (_jsxs(_Fragment, { children: [_jsxs(Link, { to: "/account?tab=orders", className: "block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200", onClick: closeDropdown, children: [_jsx("i", { className: "fas fa-shopping-bag mr-2" }), " My Orders"] }), _jsxs(Link, { to: "/account?tab=wishlist", className: "block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200", onClick: closeDropdown, children: [_jsx("i", { className: "fas fa-heart mr-2" }), " Wishlist"] })] })), _jsx("div", { className: "border-t border-gray-100 my-1" }), _jsxs("button", { onClick: handleLogout, className: "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors duration-200", children: [_jsx("i", { className: "fas fa-sign-out-alt mr-2" }), " Logout"] })] }))] }), _jsxs(Link, { to: "/account?tab=wishlist", className: "group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200", "aria-label": "Wishlist", children: [_jsx("div", { className: "relative", children: _jsx("i", { className: "fas fa-heart text-xl group-hover:scale-110 transition-transform duration-200" }) }), _jsx("span", { className: "text-xs hidden sm:inline mt-1", children: "Wishlist" })] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: toggleCartDropdown, className: "group flex flex-col items-center text-sky-700 hover:text-sky-900 transition-colors duration-200 relative", "aria-label": "Cart", children: [_jsxs("div", { className: "relative", children: [_jsx("i", { className: "fas fa-shopping-cart text-xl group-hover:scale-110 transition-transform duration-200" }), itemCount > 0 && (_jsx("span", { className: "absolute -top-2 -right-2 bg-sky-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse", children: itemCount }))] }), _jsx("span", { className: "text-xs hidden sm:inline mt-1", children: "Cart" })] }), _jsx(CartDropdown, { isOpen: isCartDropdownOpen, onClose: closeCartDropdown, cartItems: cartItems, updateQuantity: updateQuantity, removeItem: removeItem })] })] })] }), isSearchOpen && (_jsx("div", { className: "mt-3 md:hidden", children: _jsxs("div", { className: "relative w-full", children: [_jsx("input", { type: "text", placeholder: "Search products...", className: "w-full px-4 py-2 pr-10 rounded-lg border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent" }), _jsx("button", { className: "absolute right-0 top-0 h-full px-4 text-sky-600 rounded-r-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200", children: _jsx("i", { className: "fas fa-search" }) })] }) }))] }) }));
};
export default Header;
