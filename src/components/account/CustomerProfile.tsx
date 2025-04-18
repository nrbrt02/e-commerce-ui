// src/components/account/CustomerProfile.tsx
import React, { useState } from 'react';
import { customerAPI } from '../../utils/apiClient';

interface CustomerProfileProps {
  profile: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    isVerified: boolean;
  };
  onProfileUpdated: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ profile, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phone: profile.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    try {
      // Call API to update profile
      await customerAPI.updateProfile({
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined,
      });
      
      // Show success message
      setSuccessMessage('Your profile has been updated successfully');
      
      // Exit edit mode
      setIsEditing(false);
      
      // Trigger refetch of profile data
      onProfileUpdated();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                           'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-sky-50 border-b border-gray-200">
        <h2 className="font-medium text-sky-800">My Profile</h2>
      </div>
      
      <div className="p-6">
        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username field - Read only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
              </div>
              
              {/* Email field - Read only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              {/* First Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Your first name"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Last Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Your last name"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Phone field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Your phone number"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Verification Status - Read only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <div className="py-2">
                  {profile.isVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white font-medium 
                           ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="text-gray-900">{profile.username}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <div className="text-gray-900">{profile.firstName || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <div className="text-gray-900">{profile.lastName || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="text-gray-900">{profile.phone || 'Not provided'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
                <div className="text-gray-900">
                  {profile.isVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Edit button */}
            <div className="mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;