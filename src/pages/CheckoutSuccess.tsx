// src/pages/CheckoutSuccess.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from location state or use defaults
  const orderDetails = location.state?.orderDetails || {
    orderId: 'Unknown',
    email: 'your email',
    total: 0,
    items: 0,
    shippingMethod: 'Standard Delivery'
  };
  
  // Handle continue shopping button
  const handleContinueShopping = () => {
    navigate('/');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-3xl text-green-600"></i>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h1>
            <p className="text-gray-600 mb-6">
              Your order has been received and is now being processed.
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-800">Order ID: <span className="text-sky-600">{orderDetails.orderId}</span></p>
              <p className="text-sm text-gray-600 mt-1">A confirmation email has been sent to {orderDetails.email}</p>
            </div>
            
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-800 mb-2">What happens next?</h3>
              <ol className="text-sm text-gray-700 space-y-2 ml-5 list-decimal">
                <li>Our team will process your order and prepare it for shipping.</li>
                <li>You'll receive an email notification when your order ships.</li>
                <li>You can track your order status in your account dashboard.</li>
                <li>For any questions, contact our customer support team.</li>
              </ol>
            </div>
            
            <div className="text-left mb-8">
              <h3 className="font-medium text-gray-800 mb-3">Order Summary:</h3>
              <div className="flex justify-between text-sm border-b border-gray-100 pb-2 mb-2">
                <span className="text-gray-600">Order Total:</span>
                <span className="font-medium text-gray-800">Rwf{orderDetails.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 pb-2 mb-2">
                <span className="text-gray-600">Items:</span>
                <span className="text-gray-800">{orderDetails.items}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Method:</span>
                <span className="text-gray-800">{orderDetails.shippingMethod}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContinueShopping}
                className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
              >
                Continue Shopping
              </button>
              <Link
                to="/account?tab=orders"
                className="border border-sky-600 text-sky-600 px-6 py-3 rounded-lg font-medium hover:bg-sky-50 transition-colors duration-200"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;