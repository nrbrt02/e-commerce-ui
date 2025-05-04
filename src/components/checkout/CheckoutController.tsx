import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { CheckoutProvider } from '../../context/CheckoutContenxt';
import CheckoutPage from './CheckoutPage';
import CheckoutSuccess from '../../pages/CheckoutSuccess';

/**
 * CheckoutController component
 * 
 * This component encapsulates all checkout-related routes and provides
 * the checkout context to all child components. It handles routing between
 * the main checkout page and the success page.
 */
const CheckoutController: React.FC = () => {
  return (
    <CheckoutProvider>
      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/success" element={<CheckoutSuccess />} />
      </Routes>
    </CheckoutProvider>
  );
};

export default CheckoutController;