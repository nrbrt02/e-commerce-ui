import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { useScreenWidth } from '../../hooks/useScreenWidth';

const DashboardLayout: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <DashboardHeader toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex relative">
        {/* Sidebar - Now with onClose prop */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Content Area */}
        <main 
          className={`transition-all duration-300 ease-in-out flex-1 p-4 md:p-6 ${
            isSidebarOpen ? 'md:ml-64' : ''
          }`}
        >
          {/* Overlay for mobile when sidebar is open */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={closeSidebar}
            ></div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;