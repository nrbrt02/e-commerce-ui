import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();

  // Add this debug logging
  useEffect(() => {
    console.log("Sidebar - Current user object:", user);
  }, [user]);

  // Improved hasRole function
  // const hasRole = (roleName: string) => {
  //   // Debug log
  //   console.log(`Sidebar - Checking for role '${roleName}'`);

  //   // Check primaryRole first (our new property)
  //   if (user?.primaryRole === roleName) {
  //     console.log(`Sidebar - User has primary role '${roleName}'`);
  //     return true;
  //   }

  //   // Check legacy role property
  //   if (user?.role === roleName) {
  //     console.log(`Sidebar - User has role property '${roleName}'`);
  //     return true;
  //   }

  //   // Check roles array if it exists
  //   if (user?.roles) {
  //     // For array of strings
  //     if (Array.isArray(user.roles) && typeof user.roles[0] === "string") {
  //       const hasRoleInArray = user.roles.includes(roleName);
  //       if (hasRoleInArray) {
  //         console.log(
  //           `Sidebar - User has '${roleName}' in roles array (string format)`
  //         );
  //       }
  //       return hasRoleInArray;
  //     }

  //     // For array of objects with name property (from your backend)
  //     if (Array.isArray(user.roles) && typeof user.roles[0] === "object") {
  //       const hasRoleObject = user.roles.some((role) => role.name === roleName);
  //       if (hasRoleObject) {
  //         console.log(
  //           `Sidebar - User has '${roleName}' in roles array (object format)`
  //         );
  //       }
  //       return hasRoleObject;
  //     }
  //   }

  //   console.log(`Sidebar - User does NOT have role '${roleName}'`);
  //   return false;
  // };

  const isAdmin =
    user?.primaryRole === "admin" || user?.primaryRole === "superadmin";
  const isManager = user?.primaryRole === "manager";
  const isSupplier = user?.primaryRole === "supplier";

  // Or check if user is staff (any non-customer role)
  const isStaff = user?.isStaff;
  // Debug log the determined roles
  useEffect(() => {
    console.log("Sidebar - Role determination:", {
      isAdmin,
      isManager,
      isSupplier,
    });
  }, [isAdmin, isManager, isSupplier]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-center border-b">
        <h2 className="text-xl font-bold text-sky-700">Fast Shopping</h2>
      </div>

      {/* Sidebar content */}
      <div className="overflow-y-auto h-full py-4">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-700 ${
                  isActive
                    ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                    : "hover:bg-gray-100"
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard
            </NavLink>
          </li>

          {/* Products Management Section */}
          <li className="mt-6 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Catalog
            </h3>
          </li>

          {/* Products - Visible to all staff types */}
          <li>
            <NavLink
              to="/dashboard/products"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-700 ${
                  isActive
                    ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                    : "hover:bg-gray-100"
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

          {/* Categories - Visible to admin and manager */}
          {(isStaff) && (
            <li>
              <NavLink
                to="/dashboard/categories"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 ${
                    isActive
                      ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                      : "hover:bg-gray-100"
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

          {/* Sales Management Section */}
          <li className="mt-6 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sales
            </h3>
          </li>

          {/* Orders - Visible to admin and manager */}
          {(isAdmin || isManager) && (
            <li>
              <NavLink
                to="/dashboard/orders"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 ${
                    isActive
                      ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                      : "hover:bg-gray-100"
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
          )}

          {/* Customers - Visible to admin and manager */}
          {(isAdmin || isManager) && (
            <li>
              <NavLink
                to="/dashboard/customers"
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 ${
                    isActive
                      ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                      : "hover:bg-gray-100"
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
          )}

          {/* Analytics - Visible to admin only */}
          {isAdmin && (
            <>
              <li className="mt-6 px-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reports
                </h3>
              </li>
              <li>
                <NavLink
                  to="/dashboard/analytics"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-gray-700 ${
                      isActive
                        ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                        : "hover:bg-gray-100"
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

          {/* Administration Section - Visible to admin only */}
          {isAdmin && (
            <>
              <li className="mt-6 px-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Administration
                </h3>
              </li>
              <li>
                <NavLink
                  to="/dashboard/users"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-gray-700 ${
                      isActive
                        ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                        : "hover:bg-gray-100"
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
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-gray-700 ${
                      isActive
                        ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                        : "hover:bg-gray-100"
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

          {/* User Account Section */}
          <li className="mt-6 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
          </li>
          <li>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-700 ${
                  isActive
                    ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                    : "hover:bg-gray-100"
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
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-700 ${
                  isActive
                    ? "bg-sky-50 text-sky-700 border-r-4 border-sky-700"
                    : "hover:bg-gray-100"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
