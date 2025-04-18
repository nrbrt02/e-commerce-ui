import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import CustomerProfile from '../components/account/CustomerProfile';
import UpdatePassword from '../components/account/UpdatePassword';
import { customerAPI } from '../utils/apiClient';

interface CustomerProfileData {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses?: any[];
  isVerified: boolean;
}

const Account: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, openAuthModal } = useAuth();
  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Fetch customer profile when user is authenticated
  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!isAuthenticated || !user) return;
      
      // For staff users, redirect to dashboard
      if (user.role && ['admin', 'manager', 'supplier'].includes(user.role)) {
        navigate('/dashboard');
        return;
      }
      
      setIsProfileLoading(true);
      
      try {
        // Fetch customer profile from API
        // In a real app, make this request to fetch profile data
        // const response = await customerAPI.getProfile();
        
        // For development, simulate a successful response
        // This would be replaced with actual API call in production
        setTimeout(() => {
          setProfile({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: '',
            isVerified: user.isVerified || false
          });
          setIsProfileLoading(false);
        }, 500);
      } catch (err: any) {
        // If API fails or isn't available, use user data from auth
        setProfile({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: '',
          isVerified: user.isVerified || false
        });
        
        const errorMessage = err.response?.data?.message || 
                            'Failed to load profile data';
        setError(errorMessage);
        setIsProfileLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [isAuthenticated, user, navigate]);

  // Handler for profile updates
  const handleProfileUpdated = async () => {
    setIsProfileLoading(true);
    // In a real app, make this request to refresh profile data
    // const response = await customerAPI.getProfile();
    
    // For development, simulate a successful response
    setTimeout(() => {
      if (user) {
        setProfile({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: '',
          isVerified: user.isVerified || false
        });
      }
      setIsProfileLoading(false);
    }, 500);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If user is not authenticated, trigger auth modal
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [isLoading, isAuthenticated, openAuthModal]);

  // Show loading indicator while checking authentication status
  if (isLoading || isProfileLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      </Layout>
    );
  }
  
  // If user is not authenticated, redirect to home
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If user is staff/admin, redirect to dashboard
  if (user?.role && ['admin', 'manager', 'supplier'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-sky-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-bold">
                    {profile?.firstName?.[0] || profile?.username?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {profile?.firstName} {profile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left block px-3 py-2 rounded-md ${
                      activeTab === 'profile' 
                        ? 'bg-sky-100 text-sky-700 font-medium' 
                        : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    Personal Information
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left block px-3 py-2 rounded-md ${
                      activeTab === 'orders' 
                        ? 'bg-sky-100 text-sky-700 font-medium' 
                        : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    My Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full text-left block px-3 py-2 rounded-md ${
                      activeTab === 'addresses' 
                        ? 'bg-sky-100 text-sky-700 font-medium' 
                        : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    Addresses
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full text-left block px-3 py-2 rounded-md ${
                      activeTab === 'wishlist' 
                        ? 'bg-sky-100 text-sky-700 font-medium' 
                        : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    Wishlist
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full text-left block px-3 py-2 rounded-md ${
                      activeTab === 'password' 
                        ? 'bg-sky-100 text-sky-700 font-medium' 
                        : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    Change Password
                  </button>
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-2">
              {/* Error display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Profile tab */}
              {activeTab === 'profile' && profile && (
                <CustomerProfile 
                  profile={profile} 
                  onProfileUpdated={handleProfileUpdated}
                />
              )}
              
              {/* Orders tab */}
              {activeTab === 'orders' && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-4 bg-sky-50 border-b border-gray-200">
                    <h2 className="font-medium text-sky-800">My Orders</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <p>You don't have any orders yet.</p>
                      <button
                        onClick={() => navigate('/')}
                        className="mt-2 text-sky-600 hover:text-sky-800"
                      >
                        Start Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Addresses tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-4 bg-sky-50 border-b border-gray-200">
                    <h2 className="font-medium text-sky-800">My Addresses</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <p>You don't have any saved addresses.</p>
                      <button className="mt-2 text-sky-600 hover:text-sky-800">
                        Add New Address
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Wishlist tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-4 bg-sky-50 border-b border-gray-200">
                    <h2 className="font-medium text-sky-800">My Wishlist</h2>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-8 text-gray-500">
                      <p>Your wishlist is empty.</p>
                      <button
                        onClick={() => navigate('/')}
                        className="mt-2 text-sky-600 hover:text-sky-800"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Change Password tab */}
              {activeTab === 'password' && (
                <UpdatePassword />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;