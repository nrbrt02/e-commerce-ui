import React, { useEffect, useState } from 'react';
import AuthPage from '../components/auth/AuthPage';
import Layout from '../components/layout/Layout';

// In a real app, you'd have a proper auth context
// This is just for demo purposes
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const AccountPage: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  
  // Simulate checking auth status
  useEffect(() => {
    // In a real app, you'd check for a token in localStorage
    // or make an API call to validate the user's session
    const checkAuthStatus = () => {
      // For demo purposes, let's assume the user is not logged in
      setTimeout(() => {
        setAuthStatus('unauthenticated');
      }, 500);
    };
    
    checkAuthStatus();
  }, []);
  
  // Authenticated user's dashboard (placeholder)
  const UserDashboard = () => (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-sky-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-sky-200 flex items-center justify-center">
                  <i className="fas fa-user text-sky-600"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">John Doe</h3>
                  <p className="text-sm text-gray-500">john.doe@example.com</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <a href="#" className="block px-3 py-2 rounded-md bg-sky-100 text-sky-700 font-medium">
                  My Orders
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700">
                  Personal Information
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700">
                  Addresses
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700">
                  Payment Methods
                </a>
                <a href="#" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700">
                  Wishlist
                </a>
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setAuthStatus('unauthenticated')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
              <div className="text-gray-500">
                <i className="fas fa-shopping-bag text-3xl mb-3"></i>
                <p>You haven't placed any orders yet.</p>
                <a href="/products" className="mt-3 inline-block text-sky-600 hover:text-sky-800 hover:underline">
                  Browse Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <Layout>
      {authStatus === 'loading' ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
        </div>
      ) : authStatus === 'authenticated' ? (
        <UserDashboard />
      ) : (
        <AuthPage />
      )}
    </Layout>
  );
};

export default AccountPage;