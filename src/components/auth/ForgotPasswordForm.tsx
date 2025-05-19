import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, error, clearError, setAuthModalView, userType } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const success = await forgotPassword(email, userType);
      if (success) {
        setSuccessMessage(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
        setEmail('');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine the form theme color based on userType
  const getThemeColor = () => {
    switch (userType) {
      case 'supplier':
        return 'green';
      case 'admin':
        return 'purple';
      case 'customer':
      default:
        return 'blue';
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
      <h3 className="text-lg text-gray-600 mb-6 text-center">
        {userType.charAt(0).toUpperCase() + userType.slice(1)} Account
      </h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className={`bg-${themeColor}-50 text-${themeColor}-700 p-4 rounded-md mb-6`}>
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-${themeColor}-500`}
            required
            placeholder="Enter your email address"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-${themeColor}-600 text-white py-2 rounded-md font-medium transition duration-300 
                    ${isSubmitting ? `bg-${themeColor}-400 cursor-not-allowed` : `hover:bg-${themeColor}-700`}`}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Remembered your password?{' '}
          <button
            onClick={() => setAuthModalView('login')}
            className={`text-${themeColor}-600 hover:text-${themeColor}-800 font-medium`}
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;