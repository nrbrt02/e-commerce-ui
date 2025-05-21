import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CustomerRegisterForm: React.FC = () => {
  const { register, error, clearError, setAuthModalView } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear password match error when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordMatchError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError(true);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      // Set username to email before submitting
      const dataToSubmit = {
        ...registerData,
        username: registerData.email
      };
      await register(dataToSubmit, 'customer');
      // On success, show login form
      setAuthModalView('login');
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Customer Account</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Your email address"
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be used as your username to log in
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Create a password"
            minLength={8}
          />
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                      ${passwordMatchError ? 'border-red-500' : ''}`}
            required
            placeholder="Confirm your password"
          />
          {passwordMatchError && (
            <p className="mt-1 text-sm text-red-600">
              Passwords do not match
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white py-2 rounded-md font-medium transition duration-300 
                    ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => setAuthModalView('login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p className="mb-2">
          By creating an account, you agree to our
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegisterForm;