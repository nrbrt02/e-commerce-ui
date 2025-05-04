import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

// AppProviders component to wrap all global providers
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppProviders;