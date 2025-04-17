import React, { useState } from 'react';
import FormInput from './FormInput';

interface LoginFormProps {
  onSubmit: (data: LoginData) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export interface LoginData {
  email: string;
  password: string;
  isStaff?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSwitchToRegister,
  onForgotPassword
}) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    isStaff: false
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, you'd make an API call here
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ form: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-sky-800 mb-6">Login to Your Account</h2>
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
          icon={<i className="fas fa-lock"></i>}
        />
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              name="isStaff"
              checked={formData.isStaff}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
            />
            <span className="ml-2 text-gray-700">Login as admin/staff</span>
          </label>
          
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-sky-600 hover:text-sky-800 hover:underline"
          >
            Forgot password?
          </button>
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
            <>Sign In</>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-sky-600 hover:text-sky-800 hover:underline font-medium"
          >
            Register Now
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;