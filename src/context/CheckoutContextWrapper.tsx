import React from 'react';
import { CheckoutProvider } from './CheckoutContenxt';

interface CheckoutContextWrapperProps {
  children: React.ReactNode;
}

const CheckoutContextWrapper: React.FC<CheckoutContextWrapperProps> = ({ children }) => {
  return <CheckoutProvider>{children}</CheckoutProvider>;
};

export default CheckoutContextWrapper;