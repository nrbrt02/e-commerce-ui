// src/pages/Account.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthPage from '../../components/auth/AuthPage';
import { useAuth } from '../../context/AuthContext';
import customerAPI from "../../utils/customerApi";
import LoadingSpinner from './LoadingSpinner';
import CustomerDashboard from './CustomerDashboard';

const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  useEffect(() => {
    if (isAuthenticated && user?.isStaff) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !user?.isStaff) {
        setIsProfileLoading(true);
        try {
          const response = await customerAPI.getProfile();
          const profileData = response.data ? response.data.customer : response;
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
  
  const handleProfileUpdated = async (): Promise<void> => {
    if (isAuthenticated) {
      setIsProfileLoading(true);
      try {
        const response = await customerAPI.getProfile();
        const profileData = response.data ? response.data.customer : response;
        setProfile(profileData);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    }
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/account?tab=${tab}`, { replace: true });
  };

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (isAuthenticated && !user?.isStaff) {
    return (
      <CustomerDashboard
        profile={profile}
        user={user}
        activeTab={activeTab}
        isProfileLoading={isProfileLoading}
        onTabChange={handleTabChange}
        onProfileUpdated={handleProfileUpdated}
      />
    );
  }

  return <AuthPage />;
};

export default AccountPage;