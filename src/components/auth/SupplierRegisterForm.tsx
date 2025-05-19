import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const SupplierRegisterForm: React.FC = () => {
  const { register, error, clearError, setAuthModalView } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    businessAddress: '',
    taxId: '',
    contactPerson: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await register(registerData, 'supplier');
      // On success, show login form
      setAuthModalView('login');
    } catch (err) {
      console.error('Supplier registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Apply as a Supplier</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Company Information</h3>
        
        <div className="mb-4">
          <label htmlFor="companyName" className="block text-gray-700 font-medium mb-2">
            Company Name*
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Your company name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="businessAddress" className="block text-gray-700 font-medium mb-2">
            Business Address*
          </label>
          <textarea
            id="businessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Your business address"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="taxId" className="block text-gray-700 font-medium mb-2">
            Tax ID/Business Registration Number
          </label>
          <input
            type="text"
            id="taxId"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Your tax ID or business registration number"
          />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Contact Information</h3>
        
        <div className="mb-4">
          <label htmlFor="contactPerson" className="block text-gray-700 font-medium mb-2">
            Contact Person*
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Primary contact name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Business Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Your business email"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
            Business Phone*
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Your business phone number"
          />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Account Information</h3>
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
            Username*
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Choose a username"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password*
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
            Confirm Password*
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 
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
          className={`w-full bg-green-600 text-white py-2 rounded-md font-medium transition duration-300 
                    ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'hover:bg-green-700'}`}
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Supplier Application'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have a supplier account?{' '}
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
          By applying, you agree to our supplier terms and conditions
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/supplier-terms" className="hover:text-gray-700">Supplier Terms</Link>
          <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegisterForm;