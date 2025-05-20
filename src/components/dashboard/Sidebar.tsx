import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart,
  User,
  Folder,
  Users,
  Star,
  Store,
  LogOut,
  X,
  Settings,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: ('admin' | 'superadmin' | 'supplier')[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Determine active path
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  // Get user role (default to supplier if no role specified)
  const userRole = user?.role || 'supplier';
  
  // All navigation items with role permissions
const navItems: NavItem[] = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard size={20} />, 
      label: 'Dashboard', 
      roles: ['admin', 'superadmin', 'supplier'] 
    },
    { 
      path: '/dashboard/products', 
      icon: <Package size={20} />, 
      label: 'Products', 
      roles: ['admin', 'superadmin', 'supplier'] 
    },
    { 
      path: '/dashboard/categories', 
      icon: <Folder size={20} />, 
      label: 'Categories', 
      roles: ['admin', 'superadmin'] 
    },
    { 
      path: '/dashboard/orders', 
      icon: <ShoppingCart size={20} />, 
      label: 'Orders', 
      roles: ['admin', 'superadmin', 'supplier'] 
    },
    { 
      path: '/dashboard/customers', 
      icon: <Users size={20} />, 
      label: 'Customers', 
      roles: ['admin', 'superadmin'] 
    },
    { 
      path: '/dashboard/reviews', 
      icon: <Star size={20} />, 
      label: 'Reviews', 
      roles: ['admin', 'superadmin', 'supplier'] 
    },
    { 
      path: '/dashboard/analytics', 
      icon: <BarChart size={20} />, 
      label: 'Analytics', 
      roles: ['admin', 'superadmin', 'supplier'] 
    },
    { 
      path: '/dashboard/profile', 
      icon: <User size={20} />, 
      label: 'Profile', 
      roles: ['admin', 'superadmin', 'supplier'] 
    },
    { 
      path: '/dashboard/admin-settings', 
      icon: <Settings size={20} />, 
      label: 'Admin Settings', 
      roles: ['superadmin'] 
    },
    { 
      path: '/dashboard/user-management', 
      icon: <Shield size={20} />, 
      label: 'User Management', 
      roles: ['superadmin'] 
    },
];


  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole as 'admin' | 'superadmin' | 'supplier')
  );

  // Get role display name
  const getRoleDisplayName = () => {
    switch(userRole) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'supplier': return 'Supplier';
      default: return 'User';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:sticky md:top-16 md:z-0 md:h-[calc(100vh-4rem)]`}
      >
        {/* Close button (mobile only) */}
        <button
          className="md:hidden absolute top-3 right-3 text-gray-300 hover:text-white"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
        
        {/* User info */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-semibold">
              {user?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.firstName || user?.username}</p>
              <p className="text-sm text-gray-400">{getRoleDisplayName()}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 border-t border-gray-700 pt-4">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className="flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-700"
                >
                  <Store size={20} className="mr-3" />
                  <span>View Store</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-700"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;