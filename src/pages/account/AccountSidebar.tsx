import React from 'react';

interface AccountSidebarProps {
  profile: any;
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ profile, user, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'orders', icon: 'fas fa-shopping-bag', label: 'My Orders' },
    { id: 'profile', icon: 'fas fa-user-circle', label: 'Personal Information' },
    { id: 'security', icon: 'fas fa-lock', label: 'Password & Security' },
    { id: 'addresses', icon: 'fas fa-map-marker-alt', label: 'Addresses' },
    { id: 'wishlist', icon: 'fas fa-heart', label: 'Wishlist' }
  ];

  return (
    <div className="bg-sky-50 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-sky-200 flex items-center justify-center">
          <i className="fas fa-user text-sky-600"></i>
        </div>
        <div>
          <h3 className="font-medium text-gray-800">
            {profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : user?.username || user?.email?.split('@')[0] || 'User'}
          </h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left block px-3 py-2 rounded-md ${
              activeTab === tab.id 
                ? 'bg-sky-100 text-sky-700 font-medium' 
                : 'text-gray-700 hover:bg-sky-50 hover:text-sky-700'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i> {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AccountSidebar;