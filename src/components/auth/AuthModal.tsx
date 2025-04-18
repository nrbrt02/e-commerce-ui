import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPassword';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'forgot-password';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialView = 'login'
}) => {
  const { authModalView, setAuthModalView, clearError } = useAuth();

  // Set initial view when modal opens
  useEffect(() => {
    if (isOpen && initialView) {
      setAuthModalView(initialView);
    }
  }, [isOpen, initialView, setAuthModalView]);

  // Handle closing the modal
  const handleClose = () => {
    clearError();
    onClose();
  };

  // Switch between auth forms
  const switchToLogin = () => setAuthModalView('login');
  const switchToRegister = () => setAuthModalView('register');
  const switchToForgotPassword = () => setAuthModalView('forgot-password');

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={handleClose}
          aria-hidden="true"
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content area */}
          <div className="px-4 py-5 sm:p-6">
            {/* Logo */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-sky-700">Fast Shopping</h1>
              <p className="text-gray-600 mt-1">Your one-stop shop for the best deals</p>
            </div>

            {/* Auth forms */}
            {authModalView === 'login' && (
              <LoginForm 
                onSwitchToRegister={switchToRegister} 
                onSwitchToForgotPassword={switchToForgotPassword} 
              />
            )}

            {authModalView === 'register' && (
              <RegisterForm 
                onSwitchToLogin={switchToLogin} 
              />
            )}

            {authModalView === 'forgot-password' && (
              <ForgotPasswordForm 
                onSwitchToLogin={switchToLogin} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;