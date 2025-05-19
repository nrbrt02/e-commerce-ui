import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
  toggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const isSupplier = user?.primaryRole === 'supplier' || user?.role === 'supplier';
  
  return (
    <header className="z-10 bg-white shadow-md h-16 flex items-center px-4 sticky top-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {/* Menu toggle button for mobile */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            <span className="material-icons">menu</span>
          </button>
          
          {/* Logo */}
          <div className="ml-3">
            <Link to={isSupplier ? '/supplier' : '/dashboard'} className="text-xl font-bold text-gray-800">
              {isSupplier ? 'Supplier Portal' : 'Admin Dashboard'}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
            <span className="material-icons">notifications</span>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Messages */}
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative ml-1">
            <span className="material-icons">email</span>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              2
            </span>
          </button>
          
          {/* User dropdown */}
          <div className="relative ml-3">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName || user?.username}
              </span>
              <span className="material-icons text-gray-500 text-sm">
                {isDropdownOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
              </span>
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <Link
                  to={isSupplier ? '/supplier/profile' : '/dashboard/profile'}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/account/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;