import React, { useState } from 'react';
import axios from 'axios';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // API base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    try {
      // Simulate API call for password reset
      // In a real app, this would make a request to your backend
      // await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      //   email,
      //   userType: isStaff ? 'admin' : 'customer'
      // });
      
      // For development, simulate a successful request
      setTimeout(() => {
        // Display success message
        setSuccessMessage(
          'If your email exists in our system, you will receive a password reset link shortly.'
        );
        
        // Clear email field
        setEmail('');
        setIsSubmitting(false);
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                         'Something went wrong. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Forgot Password</h2>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="your@email.com"
            required
          />
        </div>
        
        {/* User type selector */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isStaff"
              checked={isStaff}
              onChange={() => setIsStaff(!isStaff)}
              className="h-4 w-4 text-sky-600 border-gray-300 rounded 
                         focus:ring-sky-500"
            />
            <label 
              htmlFor="isStaff"
              className="ml-2 block text-sm text-gray-700"
            >
              Staff/Admin Account
            </label>
          </div>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium 
                     ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      {/* Back to login link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sky-600 hover:text-sky-800 font-medium"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;