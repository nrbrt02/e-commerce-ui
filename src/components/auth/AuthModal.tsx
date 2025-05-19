import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Import forms
import CustomerLoginForm from './CustomerLoginForm';
import CustomerRegisterForm from './CustomerRegisterForm';
import SupplierLoginForm from './SupplierLoginForm';
import SupplierRegisterForm from './SupplierRegisterForm';
import AdminLoginForm from './AdminLoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalView, userType } = useAuth();

  if (!isAuthModalOpen) {
    return null;
  }

  // Render the correct form based on authModalView and userType
  const renderForm = () => {
    if (authModalView === 'forgot-password') {
      return <ForgotPasswordForm />;
    }

    switch (userType) {
      case 'supplier':
        return authModalView === 'login' ? <SupplierLoginForm /> : <SupplierRegisterForm />;
      case 'admin':
        return <AdminLoginForm />;
      case 'customer':
      default:
        return authModalView === 'login' ? <CustomerLoginForm /> : <CustomerRegisterForm />;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeAuthModal}
      ></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-0">
        <div className="relative bg-white rounded-lg shadow-xl max-h-90vh overflow-y-auto">
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={closeAuthModal}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;