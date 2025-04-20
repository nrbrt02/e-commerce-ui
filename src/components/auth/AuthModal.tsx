// src/components/auth/AuthModal.tsx
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPassword from './ForgotPassword';

type AuthModalTab = 'login' | 'register' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthModalTab;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
}) => {
  const [activeTab, setActiveTab] = useState<AuthModalTab>(defaultTab);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

  const handleSwitchToForgotPassword = () => {
    setActiveTab('forgot');
  };

  // Close modal when clicking on backdrop (outside modal content)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeTab === 'login' && 'Sign In'}
            {activeTab === 'register' && 'Create Account'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h1>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal body */}
        <div className="p-6">
          {activeTab === 'login' && (
            <LoginForm 
              onSwitchToRegister={handleSwitchToRegister}
              onSwitchToForgotPassword={handleSwitchToForgotPassword}
            />
          )}
          
          {activeTab === 'register' && (
            <RegisterForm 
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
          
          {activeTab === 'forgot' && (
            <ForgotPassword
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;