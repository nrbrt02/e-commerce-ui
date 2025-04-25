// src/components/account/UpdatePassword.tsx
import React, { useState } from 'react';
import customerApi from '../../utils/customerApi';
import { showToast } from '../../components/ui/ToastProvider';

const UpdatePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check password strength if the new password field is changed
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
    
    // Clear errors when user starts editing
    setError(null);
  };
  
  const checkPasswordStrength = (password: string): void => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }
    
    // Simple password strength check
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const checks = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars];
    const passedChecks = checks.filter(Boolean).length;
    
    if (password.length < 8 || passedChecks <= 1) {
      setPasswordStrength('weak');
    } else if (password.length >= 8 && passedChecks === 2) {
      setPasswordStrength('medium');
    } else if (password.length >= 10 && passedChecks >= 3) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  };
  
  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };
  
  const validateForm = (): boolean => {
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    // Check if new password is too short
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    // Prevent using extremely weak passwords
    if (passwordStrength === 'weak') {
      setError('Please use a stronger password with a mix of letters, numbers, and special characters');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call API to update password
      await customerApi.updatePassword(formData.currentPassword, formData.newPassword);
      
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength(null);
      
      // Show success toast
      showToast.success('Password updated successfully!');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update password. Please make sure your current password is correct.'
      );
      showToast.error('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-sky-50 border-b border-gray-200">
        <h2 className="font-medium text-sky-800">Password & Security</h2>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
                minLength={8}
              />
              
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className="text-xs font-medium">
                      {passwordStrength === 'weak' && <span className="text-red-500">Weak</span>}
                      {passwordStrength === 'medium' && <span className="text-yellow-500">Medium</span>}
                      {passwordStrength === 'strong' && <span className="text-green-500">Strong</span>}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrengthColor()}`}
                      style={{ 
                        width: passwordStrength === 'weak' ? '33%' : 
                               passwordStrength === 'medium' ? '66%' : '100%' 
                      }}
                    ></div>
                  </div>
                  
                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    <li className="flex items-center">
                      <span className={`mr-1 ${formData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-1 ${/[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Mix of uppercase & lowercase letters
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-1 ${/\d/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      At least one number
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
              {formData.newPassword && formData.confirmPassword && (
                <div className="mt-1">
                  {formData.newPassword === formData.confirmPassword ? (
                    <p className="text-xs text-green-500">Passwords match</p>
                  ) : (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              )}
            </div>
          </div>

          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;