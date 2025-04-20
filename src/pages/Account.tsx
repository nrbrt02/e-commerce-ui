// src/pages/Account.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPage from '../components/auth/AuthPage';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../utils/apiClient';
import CustomerProfile from '../components/account/CustomerProfile';
import UpdatePassword from '../components/account/UpdatePassword';

const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Redirect staff/admin users to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.isStaff) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Fetch customer profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !user?.isStaff) {
        setIsProfileLoading(true);
        try {
          const profileData = await customerAPI.getProfile();
          setProfile(profileData);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setIsProfileLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [isAuthenticated, user]);
  
  // Handle profile update
  const handleProfileUpdated = async () => {
    if (isAuthenticated) {
      setIsProfileLoading(true);
      try {
        const profileData = await customerAPI.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    }
  };
  
  // User Dashboard content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return profile ? (
          <CustomerProfile profile={profile} onProfileUpdated={handleProfileUpdated} />
        ) : (
          <div className="p-6 bg-white rounded-lg shadow">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        );
      
      case 'security':
        return <UpdatePassword />;
      
      case 'orders':
      default:
        return (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-sky-50 border-b border-gray-200">
              <h2 className="font-medium text-sky-800">My Orders</h2>
            </div>
            
            <div className="p-8 text-center bg-gray-50">
              <div className="text-gray-500">
                <i className="fas fa-shopping-bag text-3xl mb-3"></i>
                <p>You haven't placed any orders yet.</p>
                <a href="/products" className="mt-3 inline-block text-sky-600 hover:text-sky-800 hover:underline">
                  Browse Products
                </a>
              </div>
            </div>
          </div>
        );
    }
  };
  
  // Customer Dashboard component
  const CustomerDashboard = () => (
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
                  <h3 className="font-medium text-gray-800">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : user?.username}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left block px-3 py-2 rounded-md ${
                    activeTab === 'orders' 
                      ? 'bg-sky-100 text-sky-700 font-medium' 
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <i className="fas fa-shopping-bag mr-2"></i> My Orders
                </button>
                
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left block px-3 py-2 rounded-md ${
                    activeTab === 'profile' 
                      ? 'bg-sky-100 text-sky-700 font-medium' 
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <i className="fas fa-user-circle mr-2"></i> Personal Information
                </button>
                
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left block px-3 py-2 rounded-md ${
                    activeTab === 'security' 
                      ? 'bg-sky-100 text-sky-700 font-medium' 
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <i className="fas fa-lock mr-2"></i> Password & Security
                </button>
                
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left block px-3 py-2 rounded-md ${
                    activeTab === 'addresses' 
                      ? 'bg-sky-100 text-sky-700 font-medium' 
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <i className="fas fa-map-marker-alt mr-2"></i> Addresses
                </button>
                
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left block px-3 py-2 rounded-md ${
                    activeTab === 'wishlist' 
                      ? 'bg-sky-100 text-sky-700 font-medium' 
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  <i className="fas fa-heart mr-2"></i> Wishlist
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2">
            {isProfileLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Return content directly without wrapping in Layout
  return isLoading ? (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
    </div>
  ) : isAuthenticated && !user?.isStaff ? (
    <CustomerDashboard />
  ) : (
    <AuthPage />
  );
};

export default AccountPage;