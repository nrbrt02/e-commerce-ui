// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, RegisterData } from '../../context/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    isStaff: false
  });
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear password error when typing in password fields
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError(null);
    }
  };

  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    // Check password length
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setPasswordError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare registration data
      const registrationData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        isStaff: formData.isStaff,
        phone: !formData.isStaff ? formData.phone : undefined
      };
      
      // Register the user
      await register(registrationData);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        isStaff: false
      });
      
      // Redirect based on user type
      if (formData.isStaff) {
        navigate('/dashboard');
      }
      // For regular customers, the modal will close and they'll stay on the current page
      
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create an account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Username field */}
        <div className="mb-4">
          <label 
            htmlFor="username" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Choose a username"
            required
            disabled={isSubmitting}
          />
        </div>
        
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* Password field */}
        <div className="mb-4">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 
                       ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Create a password"
            required
            disabled={isSubmitting}
          />
          {passwordError && (
            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
          )}
        </div>
        
        {/* Confirm Password field */}
        <div className="mb-4">
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 
                       ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Confirm your password"
            required
            disabled={isSubmitting}
          />
        </div>
        
        {/* First Name field */}
        <div className="mb-4">
          <label 
            htmlFor="firstName" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
        <div className="mb-4">
          <label 
            htmlFor="lastName" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
        
        {/* Phone field - show only for customers */}
        {!formData.isStaff && (
          <div className="mb-4">
            <label 
              htmlFor="phone" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
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
        )}
        
        {/* User type selection */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isStaff"
              name="isStaff"
              checked={formData.isStaff}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 border-gray-300 rounded 
                         focus:ring-sky-500"
              disabled={isSubmitting}
            />
            <label 
              htmlFor="isStaff"
              className="ml-2 block text-sm text-gray-700"
            >
              Register as Supplier
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
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      {/* Login link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sky-600 hover:text-sky-800 font-medium"
            disabled={isSubmitting}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;