import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { useScreenWidth } from '../../hooks/useScreenWidth';
const DashboardLayout = () => {
    const screenWidth = useScreenWidth();
    const isMobile = Number(screenWidth) < 768;
    // Initialize sidebar state based on screen size
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
    // Update sidebar state when screen size changes
    useEffect(() => {
        setIsSidebarOpen(!isMobile);
    }, [isMobile]);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx(DashboardHeader, { toggleSidebar: toggleSidebar }), _jsxs("div", { className: "flex relative", children: [_jsx(Sidebar, { isOpen: isSidebarOpen, onClose: closeSidebar }), _jsxs("main", { className: `transition-all duration-300 ease-in-out flex-1 p-4 md:p-6 ${isSidebarOpen ? 'md:ml-64' : ''}`, children: [isMobile && isSidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-10", onClick: closeSidebar })), _jsx(Outlet, {})] })] })] }));
};
export default DashboardLayout;
