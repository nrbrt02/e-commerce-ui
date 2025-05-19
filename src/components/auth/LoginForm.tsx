import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserType } from '../../context/AuthContext';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToRegister, 
  onSwitchToForgotPassword 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, error, clearError, setUserType: setContextUserType } = useAuth();
  const navigate = useNavigate();

  // Update context user type when local state changes
  useEffect(() => {
    setContextUserType(userType);
  }, [userType, setContextUserType]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    
    try {
      console.log('Attempting login with:', { email, password, userType });
      // Wait for the login to complete - now using boolean return value
      const isSuccess = await login(email, password, userType);
      
      // Clear form
      setEmail('');
      setPassword('');
      
      // Only navigate if login was successful
      if (isSuccess) {
        console.log('Login successful, navigating user based on role');
        
        // Using setTimeout to ensure state updates have propagated
        setTimeout(() => {
          if (userType === 'admin') {
            console.log('Navigating admin user to dashboard');
            navigate('/dashboard');
          } else if (userType === 'supplier') {
            console.log('Navigating supplier user to dashboard/products');
            navigate('/dashboard/products');
          } else {
            console.log('Navigating customer user to account page');
            navigate('/account');
          }
        }, 500); // Increased timeout to give more time for auth state to update
      }
    } catch (err) {
      // Error handling is done by AuthContext
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Login to your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
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
            disabled={isSubmitting}
          />
        </div>
        
        {/* Password field */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label 
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-sky-600 hover:text-sky-800"
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-sky-600"
              tabIndex={-1}
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <EyeIcon className="w-5 h-5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          </div>
        </div>
        
        {/* User type selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Login as
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`border rounded-md p-3 text-center cursor-pointer transition-all 
                         ${userType === "customer" 
                          ? "border-sky-500 bg-sky-50 text-sky-700" 
                          : "border-gray-300 hover:border-gray-400"}`}
              onClick={() => setUserType("customer")}
            >
              Customer
            </div>
            <div
              className={`border rounded-md p-3 text-center cursor-pointer transition-all 
                         ${userType === "supplier" 
                          ? "border-sky-500 bg-sky-50 text-sky-700" 
                          : "border-gray-300 hover:border-gray-400"}`}
              onClick={() => setUserType("supplier")}
            >
              Supplier
            </div>
            <div
              className={`border rounded-md p-3 text-center cursor-pointer transition-all 
                         ${userType === "admin" 
                          ? "border-sky-500 bg-sky-50 text-sky-700" 
                          : "border-gray-300 hover:border-gray-400"}`}
              onClick={() => setUserType("admin")}
            >
              Admin
            </div>
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
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      {/* Register link - only show for customer and supplier */}
      {userType !== "admin" && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sky-600 hover:text-sky-800 font-medium"
              disabled={isSubmitting}
            >
              Sign Up
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;