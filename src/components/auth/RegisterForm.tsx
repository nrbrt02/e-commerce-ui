import React, { useState } from 'react';
import FormInput from './FormInput';

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => void;
  onSwitchToLogin: () => void;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSwitchToLogin
}) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase and number';
    }
    
    // Confirm password validation
    if (formData.password && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...dataToSubmit } = formData;
      
      // In a real app, you'd make an API call here
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ form: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-sky-800 mb-6">Create an Account</h2>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="firstName"
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            placeholder="John"
            required
            icon={<i className="fas fa-user"></i>}
          />
          
          <FormInput
            id="lastName"
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            placeholder="Doe"
            required
            icon={<i className="fas fa-user"></i>}
          />
        </div>
        
        <FormInput
          id="username"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="johndoe"
          required
          icon={<i className="fas fa-user-tag"></i>}
        />
        
        <FormInput
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="your@email.com"
          required
          autoComplete="email"
          icon={<i className="fas fa-envelope"></i>}
        />
        
        <FormInput
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          icon={<i className="fas fa-lock"></i>}
        />
        
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          icon={<i className="fas fa-lock"></i>}
        />
        
        <div className="mt-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="h-4 w-4 mt-1 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
            />
            <span className="ml-2 text-gray-700 text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-sky-600 hover:underline">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-sky-600 hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">
              {errors.acceptTerms}
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
            isLoading 
              ? 'bg-sky-300 cursor-not-allowed' 
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>Create Account</>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sky-600 hover:text-sky-800 hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;