// src/components/account/UpdatePassword.tsx
import React, { useState } from 'react';
import { authAPI } from '../../utils/apiClient';

const UpdatePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = () => {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    
    // Check password length
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setPasswordError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call API to update password
      await authAPI.updatePassword(currentPassword, newPassword);
      
      // Show success message
      setSuccessMessage('Your password has been updated successfully');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                           'Failed to update password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-sky-50 border-b border-gray-200">
        <h2 className="font-medium text-sky-800">Change Password</h2>
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
        
        <form onSubmit={handleSubmit}>
          {/* Current Password field */}
          <div className="mb-4">
            <label 
              htmlFor="currentPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your current password"
              required
              disabled={isSubmitting}
            />
          </div>
          
          {/* New Password field */}
          <div className="mb-4">
            <label 
              htmlFor="newPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
              }}
              className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 
                         ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your new password"
              required
              disabled={isSubmitting}
            />
          </div>
          
          {/* Confirm New Password field */}
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 
                         ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Confirm your new password"
              required
              disabled={isSubmitting}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white font-medium 
                       ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;