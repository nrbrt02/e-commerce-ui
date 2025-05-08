import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import CustomerProfile from '../../pages/Customers';
import UpdatePassword from './UpdatePassword';
import AddressManagement from './AddressManagement';
import OrdersTab from './OrdersTab';

interface TabContentRendererProps {
  activeTab: string;
  isProfileLoading: boolean;
  profile: any;
  onProfileUpdated: () => Promise<void>;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  activeTab,
  isProfileLoading,
  profile,
}) => {
  if (isProfileLoading) {
    return <LoadingSpinner className="h-48" />;
  }

  switch (activeTab) {
    case 'profile':
      return profile ? (
        <CustomerProfile />
      ) : (
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      );
    
    case 'security':
      return <UpdatePassword />;
      
    case 'addresses':
      return profile ? (
        <AddressManagement />
      ) : (
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-gray-500">Loading addresses...</p>
        </div>
      );
      
    case 'orders':
    default:
      return <OrdersTab />;
  }
};

export default TabContentRenderer;