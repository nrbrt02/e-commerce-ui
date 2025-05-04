import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import SupplierActions from "../components/dashboard/SupplierActions";
import ErrorAlert from "../components/dashboard/ErrorAlert";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface RecentActivityItem {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  timeAgo: string;
}

interface RoleObject {
  name: string;
  permissions?: string[];
}

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
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug log the user object when it changes
  useEffect(() => {
    console.log('Dashboard - Current user object:', user);
  }, [user]);

  // Improved hasRole function with debug logs and proper type checking
  const hasRole = (roleName: string): boolean => {
    console.log(`Dashboard - Checking for role '${roleName}'`);

    if (!user) return false;

    const typedUser = user as UserWithRoles;

    if (typedUser?.primaryRole === roleName) {
      console.log(`Dashboard - User has primary role '${roleName}'`);
      return true;
    }
    
    if (typedUser?.role === roleName) {
      console.log(`Dashboard - User has role property '${roleName}'`);
      return true;
    }
    
    if (typedUser?.roles) {
      return typedUser.roles.some(role => {
        if (typeof role === 'string') {
          const hasStringRole = role === roleName;
          if (hasStringRole) {
            console.log(`Dashboard - User has '${roleName}' in roles array (string format)`);
          }
          return hasStringRole;
        } else {
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
        console.log('Fetching dashboard data with roles:', { isAdmin, isManager, isSupplier });
        
        // Mock data fetch
        setTimeout(() => {
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
              totalCustomers: 0,
              totalRevenue: 7685.25,
            });
          }

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

  return (
    <div className="w-full px-0">
      {/* Error Alert */}
      <ErrorAlert error={error} />

      {/* Stats Grid */}
      <StatsGrid
        stats={stats}
        isLoading={isLoading}
        isAdmin={isAdmin}
        isManager={isManager}
        isSupplier={isSupplier}
      />

      {/* Recent Activity */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-3">
          Recent Activity
        </h2>
        <RecentActivity
          activities={recentActivities}
          isLoading={isLoading}
          isAdmin={isAdmin}
          isManager={isManager}
          isSupplier={isSupplier}
        />
      </div>

      {/* Role-based Actions */}
      {(isAdmin || isManager) && <QuickActions />}
      {isSupplier && <SupplierActions />}
    </div>
  );
};

export default Dashboard;