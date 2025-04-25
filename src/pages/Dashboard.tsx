import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// import axios from "axios";
// import { DashboardHeader } from "../components/dashboard";

// API base URL
// const API_BASE_URL =
  // import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  timeAgo: string;
}

// Define proper types for user roles
interface RoleObject {
  name: string;
  permissions?: string[];
}

// Extended user type to properly handle role structures
interface UserWithRoles {
  firstName?: string;
  username?: string;
  primaryRole?: string;
  role?: string;
  roles?: (string | RoleObject)[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug log the user object when it changes
  useEffect(() => {
    console.log('Dashboard - Current user object:', user);
  }, [user]);

  // Improved hasRole function with debug logs and proper type checking
  const hasRole = (roleName: string): boolean => {
    // Debug log
    console.log(`Dashboard - Checking for role '${roleName}'`);

    if (!user) return false;

    // Cast user to our extended type for better TypeScript support
    const typedUser = user as UserWithRoles;

    // Check primaryRole first (our new property)
    if (typedUser?.primaryRole === roleName) {
      console.log(`Dashboard - User has primary role '${roleName}'`);
      return true;
    }
    
    // Check legacy role property
    if (typedUser?.role === roleName) {
      console.log(`Dashboard - User has role property '${roleName}'`);
      return true;
    }
    
    // Check roles array if it exists
    if (typedUser?.roles) {
      // For array of strings or objects
      return typedUser.roles.some(role => {
        if (typeof role === 'string') {
          const hasStringRole = role === roleName;
          if (hasStringRole) {
            console.log(`Dashboard - User has '${roleName}' in roles array (string format)`);
          }
          return hasStringRole;
        } else {
          // Role is an object with name property
          const hasObjectRole = role.name === roleName;
          if (hasObjectRole) {
            console.log(`Dashboard - User has '${roleName}' in roles array (object format)`);
          }
          return hasObjectRole;
        }
      });
    }
    
    console.log(`Dashboard - User does NOT have role '${roleName}'`);
    return false;
  };

  // Make role checks mutually exclusive
  const isAdmin = hasRole('admin');
  const isManager = !isAdmin && hasRole('manager');
  const isSupplier = !isAdmin && !isManager && hasRole('supplier');
  const isCustomer = !isAdmin && !isManager && !isSupplier;

  // Debug log the determined roles
  useEffect(() => {
    console.log('Dashboard - Role determination:', { isAdmin, isManager, isSupplier, isCustomer });
  }, [isAdmin, isManager, isSupplier, isCustomer]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Debug which stats will be shown based on role
        console.log('Fetching dashboard data with roles:', { isAdmin, isManager, isSupplier });
        
        // In a real app, fetch from API
        // const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
        // setStats(response.data);

        // For now, use mock data
        setTimeout(() => {
          // Different stats based on role
          if (isAdmin) {
            console.log('Setting ADMIN stats');
            setStats({
              totalProducts: 157,
              totalOrders: 43,
              totalCustomers: 125,
              totalRevenue: 15950.5,
            });
          } else if (isManager) {
            console.log('Setting MANAGER stats');
            setStats({
              totalProducts: 157,
              totalOrders: 43,
              totalCustomers: 125,
              totalRevenue: 12450.75,
            });
          } else if (isSupplier) {
            console.log('Setting SUPPLIER stats');
            setStats({
              totalProducts: 78,
              totalOrders: 24,
              totalCustomers: 0, // Suppliers might not see customer data
              totalRevenue: 7685.25,
            });
          }

          // Recent activities
          setRecentActivities([
            {
              id: 1,
              type: "order",
              title: "New order placed",
              subtitle: "Order #12345 - $128.99",
              timeAgo: "2 hours ago",
            },
            {
              id: 2,
              type: "customer",
              title: "New customer registered",
              subtitle: "John Smith",
              timeAgo: "4 hours ago",
            },
            {
              id: 3,
              type: "product",
              title: "Product updated",
              subtitle: "Smartphone XYZ - Stock: 24",
              timeAgo: "6 hours ago",
            },
            {
              id: 4,
              type: "review",
              title: "Product review received",
              subtitle: "Wireless Headphones - 4.5 ★",
              timeAgo: "Yesterday",
            },
            {
              id: 5,
              type: "order",
              title: "Order completed",
              subtitle: "Order #12340 - $56.78",
              timeAgo: "Yesterday",
            },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load dashboard data";
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, isManager, isSupplier]);

  // Format the date
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      {/* Dashboard header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome card */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800">
          {getGreeting()}, {user?.firstName || user?.username}!
        </h2>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your{" "}
          {isAdmin || isManager ? "store" : "account"} today.
        </p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Products card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              </div>
            </div>
          </div>

          {/* Orders card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
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
              </div>
            </div>
          </div>

          {/* Customers card - Only visible to admin and manager */}
          {(isAdmin || isManager) && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Revenue card - Only visible to admin and manager */}
          {(isAdmin || isManager || isSupplier) && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {isSupplier ? "Your Revenue" : "Total Revenue"}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    $
                    {stats.totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent activity section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">
          Recent Activity
        </h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="animate-pulse p-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="py-4 border-b border-gray-200 last:border-0"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentActivities.map(
                (activity) => {
                  // Debug log for activity filtering
                  console.log(`Filtering activity ${activity.id} of type ${activity.type}:`, {
                    showToAdmin: isAdmin,
                    showToManager: isManager,
                    showToSupplier: isSupplier
                  });
                  
                  return (
                    // Filter activities based on role
                    (activity.type !== "customer" || isAdmin || isManager) &&
                    (activity.type !== "revenue" ||
                      isAdmin ||
                      isManager ||
                      isSupplier) && (
                      <div key={activity.id} className="p-4 hover:bg-gray-50">
                        <p className="text-sm font-medium text-gray-800">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.subtitle}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timeAgo}
                        </p>
                      </div>
                    )
                  );
                }
              )}
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 text-right">
            <button className="text-sm font-medium text-sky-600 hover:text-sky-800">
              View All Activity →
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions section - visible only to admin and manager */}
      {(() => {
        console.log('Should show admin/manager quick actions?', isAdmin || isManager);
        return (isAdmin || isManager) && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50">
                <div className="rounded-full bg-sky-100 p-3 mr-4">
                  <svg
                    className="h-6 w-6 text-sky-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Add Product</p>
                  <p className="text-xs text-gray-500">
                    Create a new product listing
                  </p>
                </div>
              </button>
              <button className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Process Orders</p>
                  <p className="text-xs text-gray-500">Manage pending orders</p>
                </div>
              </button>
              <button className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Update Inventory</p>
                  <p className="text-xs text-gray-500">Adjust stock levels</p>
                </div>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Supplier-specific section */}
      {(() => {
        console.log('Should show supplier section?', isSupplier);
        return isSupplier && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-3">
              Supply Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50">
                <div className="rounded-full bg-indigo-100 p-3 mr-4">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Update Inventory</p>
                  <p className="text-xs text-gray-500">
                    Update your product stock
                  </p>
                </div>
              </button>
              <button className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50">
                <div className="rounded-full bg-pink-100 p-3 mr-4">
                  <svg
                    className="h-6 w-6 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Delivery Schedule</p>
                  <p className="text-xs text-gray-500">
                    View upcoming deliveries
                  </p>
                </div>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Dashboard;