import React, { useState } from 'react';
import FormInput from './FormInput';

interface ForgotPasswordProps {
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onSubmit,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you'd make an API call here
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(email);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-sky-800 mb-2">Reset Your Password</h2>
      
      {!isSubmitted ? (
        <>
          <p className="text-gray-600 mb-6">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
              placeholder="your@email.com"
              required
              icon={<i className="fas fa-envelope"></i>}
              autoComplete="email"
            />
            
            <div className="flex flex-col space-y-3">
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
                  <>Send Reset Instructions</>
                )}
              </button>
              
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-sky-600 hover:text-sky-800 hover:underline text-center"
              >
                Back to Login
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="mb-4 mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <i className="fas fa-check text-2xl text-green-500"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h3>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to: <br />
            <span className="font-medium">{email}</span>
          </p>
          <button
            onClick={onBackToLogin}
            className="text-sky-600 hover:text-sky-800 hover:underline"
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;