import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Determine user roles (optimized)
  const isAdmin = ["admin", "superadmin"].includes(user?.primaryRole || "");
  const isManager = user?.primaryRole === "manager";
  const isStaff = user?.isStaff;

  // Track active section for collapsible menus
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (pathParts.length > 2) {
      setActiveSection(pathParts[2]);
    } else {
      setActiveSection(null);
    }
  }, [location]);

  // Close sidebar when clicking a link (mobile)
  const handleNavigation = () => {
    if (window.innerWidth < 768) onClose();
  };

  // Swipe to close (mobile)
  useEffect(() => {
    if (!isOpen) return;

    const sidebar = document.querySelector("aside");
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentX = e.touches[0].clientX;
      if (startX - currentX > 50) onClose(); // Swipe left to close
    };

    sidebar?.addEventListener("touchstart", handleTouchStart);
    sidebar?.addEventListener("touchmove", handleTouchMove);

    return () => {
      sidebar?.removeEventListener("touchstart", handleTouchStart);
      sidebar?.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay with fade-in animation (mobile only) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar with slide animation */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 25 }}
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-72 md:w-72 bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-100 dark:border-gray-800 h-screen md:translate-x-0 ${
          isOpen ? "" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* User Profile Card */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 rounded-full h-10 w-10 flex items-center justify-center font-medium">
            {user?.firstName?.[0] ||
              user?.username?.[0] ||
              user?.name?.[0] ||
              "U"}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
              {user?.firstName || user?.username || user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.primaryRole || user?.role || "user"}
            </p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="overflow-y-auto h-[calc(100vh-7.5rem)] py-2 custom-scrollbar">
          <ul className="space-y-1">
            {/* Dashboard */}
            <li>
              <NavLink
                to="/dashboard"
                end
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Dashboard
              </NavLink>
            </li>
            {/* Catalog Section */}
            <li className="mt-4 px-4">
              <h3
                className={`text-xs font-semibold uppercase tracking-wider ${
                  activeSection === "products" || activeSection === "categories"
                    ? "text-sky-500 dark:text-sky-400"
                    : "text-gray-400"
                }`}
              >
                Catalog
              </h3>
            </li>
            <li>
              <NavLink
                to="/dashboard/products"
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Products
              </NavLink>
            </li>
            
            <li>
              <NavLink
                to="/dashboard/reviews"
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                My Reviews
              </NavLink>
            </li>
            {isStaff && (
              <li>
                <NavLink
                  to="/dashboard/categories"
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                      isActive
                        ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Categories
                </NavLink>
              </li>
            )}
            {/* Sales Section (Admin/Manager) */}
            {(isAdmin || isManager) && (
              <>
                <li className="mt-4 px-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Sales
                  </h3>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/customers"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Customers
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/orders"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Orders
                  </NavLink>
                </li>
              </>
            )}
            {/* Reports (Admin Only) */}
            {isAdmin && (
              <>
                <li className="mt-4 px-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Reports
                  </h3>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/analytics"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Analytics
                  </NavLink>
                </li>
              </>
            )}
            {/* Admin Section (Admin Only) */}
            {isAdmin && (
              <>
                <li className="mt-4 px-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administration
                  </h3>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/users"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Users & Permissions
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/settings"
                    onClick={handleNavigation}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Store Settings
                  </NavLink>
                </li>
              </>
            )}
            {/* Account Section */}
            <li className="mt-4 px-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Account
              </h3>
            </li>
            <li>
              <NavLink
                to="/dashboard/profile"
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium border-r-4 border-sky-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                My Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/logout"
                onClick={handleNavigation}
                className="flex items-center px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </NavLink>
            </li>
          </ul>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
