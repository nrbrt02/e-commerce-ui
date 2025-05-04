import React from 'react';
import { useCheckout } from '../../context/CheckoutContenxt';

const OrderReview: React.FC = () => {
  const {
    addressData,
    selectedShippingMethod,
    deliveryOptions,
    selectedPaymentMethod,
    paymentData,
    submitOrder,
    isProcessingOrder,
    cartItems,
    totalAmount,
    totalSavings,
    shippingCost,
    taxAmount,
    totalOrderAmount
  } = useCheckout();

  // Find selected shipping method
  const selectedShipping = deliveryOptions.find(
    option => option.id === selectedShippingMethod
  );

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment method display name
  const getPaymentMethodDisplay = (): string => {
    switch (selectedPaymentMethod) {
      case 'card':
        return `Credit Card ending in ${paymentData.cardNumber.replace(/\D/g, '').slice(-4)}`;
      case 'paypal':
        return 'PayPal';
      case 'mobilemoney':
        return 'Mobile Money';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Selected Payment Method';
    }
  };

  // Handle submit order button click
  const handleSubmitOrder = async () => {
    await submitOrder();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Review Your Order</h2>

      <div className="space-y-6">
        {/* Shipping information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <i className="fas fa-map-marker-alt mr-2 text-sky-500"></i>
            Shipping Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800">{addressData.firstName} {addressData.lastName}</p>
            <p className="text-gray-600">{addressData.email}</p>
            <p className="text-gray-600">{addressData.phone}</p>
            <p className="text-gray-600">{addressData.address}</p>
            {addressData.address2 && <p className="text-gray-600">{addressData.address2}</p>}
            <p className="text-gray-600">{addressData.city}, {addressData.state} {addressData.postalCode}</p>
            <p className="text-gray-600">{addressData.country}</p>
          </div>
        </div>

        {/* Delivery method */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <i className="fas fa-truck mr-2 text-sky-500"></i>
            Delivery Method
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-800">{selectedShipping?.name}</p>
                <p className="text-gray-600 text-sm">{selectedShipping?.description}</p>
                {selectedShipping?.estimatedDelivery && (
                  <p className="text-gray-600 text-sm mt-1">
                    <i className="far fa-calendar-alt mr-1"></i>
                    Estimated delivery: {selectedShipping.estimatedDelivery}
                  </p>
                )}
              </div>
              <p className="text-gray-800 font-medium">
                {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment information */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <i className="fas fa-credit-card mr-2 text-sky-500"></i>
            Payment Method
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800">{getPaymentMethodDisplay()}</p>
            {selectedPaymentMethod === 'card' && (
              <p className="text-gray-600 text-sm">
                {paymentData.cardName} | Expires: {paymentData.expiryDate}
              </p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <i className="fas fa-shopping-cart mr-2 text-sky-500"></i>
            Order Summary
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Discount</span>
                  <span>-{formatCurrency(totalSavings)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Tax (18%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-900">{formatCurrency(totalOrderAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button for desktop */}
        <div className="hidden md:block">
          <button
            onClick={handleSubmitOrder}
            className="w-full py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center"
            disabled={isProcessingOrder}
          >
            {isProcessingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Order...
              </>
            ) : (
              <>
                Place Order
                <i className="fas fa-check-circle ml-2"></i>
              </>
            )}
          </button>
          <p className="text-center text-gray-500 text-sm mt-2">
            By placing your order, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;