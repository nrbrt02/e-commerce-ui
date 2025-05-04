import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContenxt';
import OrderComplete from '../components/checkout/OrderComplete';
import { useCart } from '../context/CartContext';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { orderDetails, orderComplete, addressData, totalAmount, shippingCost, taxAmount, totalOrderAmount } = useCheckout();
  const cartContext = useCart();
  
  // Redirect to home if no order details are available
  useEffect(() => {
    if (!orderComplete && !orderDetails) {
      navigate('/');
    }
  }, [orderComplete, orderDetails, navigate]);
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/');
  };
  
  // If no order details, show a fallback message
  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <div className="text-green-500 text-6xl mb-6">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 mb-8">
            Your order has been placed successfully.
          </p>
          <Link
            to="/"
            className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <OrderComplete
      orderId={orderDetails.orderNumber || 'N/A'}
      email={addressData.email}
      totalAmount={totalAmount}
      shippingCost={shippingCost}
      taxAmount={taxAmount}
      totalOrderAmount={totalOrderAmount}
      onContinueShopping={handleContinueShopping}
    />
  );
};

export default CheckoutSuccess;