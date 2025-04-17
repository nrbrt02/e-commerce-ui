import React, { useState } from 'react';
import LoginForm, { LoginData } from './LoginForm';
import RegisterForm, { RegisterData } from './RegisterForm';
import ForgotPassword from './ForgotPassword';

type AuthView = 'login' | 'register' | 'forgot-password';

interface AuthPageProps {
  initialView?: AuthView;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialView = 'login' }) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  // In a real app, these handlers would make API calls to your backend
  const handleLogin = (data: LoginData) => {
    console.log('Login submitted:', data);
    // After successful login:
    // 1. Store auth token/user data in context or localStorage
    // 2. Redirect user to dashboard or homepage
    alert('Login successful! Redirecting...');
  };

  const handleRegister = (data: RegisterData) => {
    console.log('Registration submitted:', data);
    // After successful registration:
    // 1. You might automatically log the user in
    // 2. Or redirect to login with a success message
    alert('Registration successful! Please login.');
    setCurrentView('login');
  };

  const handleForgotPassword = (email: string) => {
    console.log('Password reset requested for:', email);
    // In a real app, this would call your API endpoint
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/branding area */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-sky-600">Fast</span>
              <span className="text-3xl font-bold text-sky-800">Shopping</span>
            </div>
          </div>
          <h2 className="text-gray-600">
            {currentView === 'login' && 'Sign in to your account'}
            {currentView === 'register' && 'Create a new account'}
            {currentView === 'forgot-password' && 'Reset your password'}
          </h2>
        </div>

        {/* Form container with animation */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'login' && (
            <LoginForm 
              onSubmit={handleLogin}
              onSwitchToRegister={() => setCurrentView('register')}
              onForgotPassword={() => setCurrentView('forgot-password')}
            />
          )}
          
          {currentView === 'register' && (
            <RegisterForm 
              onSubmit={handleRegister}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
          
          {currentView === 'forgot-password' && (
            <ForgotPassword 
              onSubmit={handleForgotPassword}
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By using Fast Shopping, you agree to our{' '}
            <a href="/terms" className="text-sky-600 hover:text-sky-800 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-sky-600 hover:text-sky-800 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;