// src/components/account/CustomerDashboard.tsx
import React from 'react';
import AccountSidebar from './AccountSidebar';
import TabContentRenderer from './TabContentRenderer';

interface CustomerDashboardProps {
  profile: any;
  user: any | null;
  activeTab: string;
  isProfileLoading: boolean;
  onTabChange: (tab: string) => void;
  onProfileUpdated: () => Promise<void>; // Changed from void to Promise<void>
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  profile,
  user,
  activeTab,
  isProfileLoading,
  onTabChange,
  onProfileUpdated
}) => {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AccountSidebar 
              profile={profile} 
              user={user} 
              activeTab={activeTab} 
              onTabChange={onTabChange} 
            />
          </div>
          
          <div className="md:col-span-2">
            <TabContentRenderer
              activeTab={activeTab}
              isProfileLoading={isProfileLoading}
              profile={profile}
              onProfileUpdated={onProfileUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;