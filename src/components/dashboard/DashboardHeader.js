import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
const DashboardHeader = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    // Check for mobile screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Initial check
        checkScreenSize();
        // Add event listener
        window.addEventListener('resize', checkScreenSize);
        // Clean up
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (isDropdownOpen && !target.closest('.user-menu')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);
    const handleLogout = () => {
        logout();
        navigate('/account');
    };
    return (_jsx("header", { className: "bg-sky-700 text-white shadow-lg z-50 sticky top-0", children: _jsxs("div", { className: "flex items-center justify-between h-16 px-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: toggleSidebar, className: "mr-4 text-white hover:text-gray-200 focus:outline-none", "aria-label": "Toggle sidebar", title: "Toggle sidebar", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsx("span", { className: "text-white font-bold text-xl", children: "Fast Shopping" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("button", { className: "text-white hover:text-gray-200 relative focus:outline-none", "aria-label": "Notifications", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }), _jsx("span", { className: "absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500", "aria-hidden": "true" })] }), _jsxs("div", { className: "relative user-menu", children: [_jsxs("button", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: "flex items-center space-x-2 focus:outline-none", "aria-expanded": isDropdownOpen, "aria-haspopup": "true", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-sky-800 flex items-center justify-center", children: user?.firstName?.[0] || user?.username?.[0] || 'U' }), !isMobile && (_jsxs(_Fragment, { children: [_jsx("span", { className: "hidden md:block", children: user?.firstName || user?.username }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: `h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }))] }), isDropdownOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20", children: [_jsx("a", { href: "/dashboard/profile", className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Profile" }), _jsx("a", { href: "/dashboard/settings", className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Settings" }), _jsx("hr", { className: "my-1" }), _jsx("button", { onClick: handleLogout, className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Logout" })] }))] })] })] }) }));
};
export default DashboardHeader;
