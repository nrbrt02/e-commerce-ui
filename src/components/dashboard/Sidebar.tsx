import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isSupplier?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isSupplier = false }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Determine active path
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Generate navigation items based on role
  const getNavItems = () => {
    if (isSupplier) {
      return [
        { path: '/supplier', icon: 'dashboard', label: 'Dashboard' },
        { path: '/supplier/products', icon: 'inventory', label: 'Products' },
        { path: '/supplier/orders', icon: 'shopping_cart', label: 'Orders' },
        { path: '/supplier/stats', icon: 'bar_chart', label: 'Analytics' },
        { path: '/supplier/profile', icon: 'account_circle', label: 'Profile' },
      ];
    } else {
      return [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/dashboard/products', icon: 'inventory', label: 'Products' },
        { path: '/dashboard/categories', icon: 'category', label: 'Categories' },
        { path: '/dashboard/orders', icon: 'shopping_cart', label: 'Orders' },
        { path: '/dashboard/customers', icon: 'people', label: 'Customers' },
        { path: '/dashboard/reviews', icon: 'star', label: 'Reviews' },
      ];
    }
  };
  
  const navItems = getNavItems();
  const basePath = isSupplier ? '/supplier' : '/dashboard';
  
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      
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
        >
          <span className="material-icons">close</span>
        </button>
        
        {/* User info */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-semibold">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.firstName || user?.username}</p>
              <p className="text-sm text-gray-400">{isSupplier ? 'Supplier' : 'Admin'}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
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
                  <span className="material-icons mr-3">storefront</span>
                  <span>View Store</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 rounded-md text-gray-300 hover:bg-gray-700"
                >
                  <span className="material-icons mr-3">logout</span>
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