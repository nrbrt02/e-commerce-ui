import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Bell,
  Mail,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";

const DashboardHeader: React.FC<{ toggleSidebar: () => void }> = ({
  toggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getDashboardTitle = () => {
    if (user?.role === "superadmin" || user?.primaryRole === "superadmin") {
      return "Super Admin Dashboard";
    } else if (user?.role === "admin" || user?.primaryRole === "admin") {
      return "Admin Dashboard";
    } else if (user?.role === "supplier" || user?.primaryRole === "supplier") {
      return "Supplier Dashboard";
    }
    return "Dashboard";
  };

  return (
    <header className="z-10 bg-white shadow-md h-16 flex items-center px-4 sticky top-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="ml-3">
            <Link
              to="/dashboard"
              className="text-xl font-bold text-gray-800"
            >
              {getDashboardTitle()}
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
            <Mail size={20} />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              2
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold">
                {user?.firstName?.charAt(0)?.toUpperCase() ||
                  user?.username?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName || user?.username}
              </span>
              {isDropdownOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/dashboard/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserIcon size={16} className="mr-2" />
                  Profile
                </Link>
                {(user?.role === "superadmin" ||
                  user?.primaryRole === "superadmin") && (
                  <Link
                    to="/dashboard/admin-settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Admin Settings
                  </Link>
                )}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
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