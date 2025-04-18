import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPassword';

enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot-password'
}

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);

  // Function to switch between auth modes
  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
  };

  // Render the appropriate form based on the current auth mode
  const renderAuthForm = () => {
    switch (authMode) {
      case AuthMode.LOGIN:
        return (
          <LoginForm 
            onSwitchToRegister={() => switchAuthMode(AuthMode.REGISTER)} 
            onSwitchToForgotPassword={() => switchAuthMode(AuthMode.FORGOT_PASSWORD)} 
          />
        );
      case AuthMode.REGISTER:
        return (
          <RegisterForm 
            onSwitchToLogin={() => switchAuthMode(AuthMode.LOGIN)} 
          />
        );
      case AuthMode.FORGOT_PASSWORD:
        return (
          <ForgotPasswordForm 
            onSwitchToLogin={() => switchAuthMode(AuthMode.LOGIN)} 
          />
        );
      default:
        return <LoginForm 
          onSwitchToRegister={() => switchAuthMode(AuthMode.REGISTER)} 
          onSwitchToForgotPassword={() => switchAuthMode(AuthMode.FORGOT_PASSWORD)} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Fast Shopping</h1>
          <p className="text-gray-600 mt-2">Your one-stop shop for the best deals</p>
        </div>
        
        {renderAuthForm()}
      </div>
    </div>
  );
};

export default AuthPage;