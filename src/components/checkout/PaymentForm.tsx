import React from 'react';
import { useCheckout } from '../../context/CheckoutContenxt';

const PaymentForm: React.FC = () => {
  const { 
    paymentMethods, 
    selectedPaymentMethod, 
    setSelectedPaymentMethod,
    paymentData,
    handlePaymentChange,
    handleCheckboxChange
  } = useCheckout();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
      
      {/* Payment method selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPaymentMethod === method.id
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPaymentMethod(method.id)}
            >
              <div className="flex items-center">
                {/* Radio button */}
                <div
                  className={`h-5 w-5 border rounded-full flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-sky-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedPaymentMethod === method.id && (
                    <div className="h-3 w-3 rounded-full bg-sky-600"></div>
                  )}
                </div>
                
                {/* Method details */}
                <div className="ml-3 flex items-center">
                  <i className={`fas ${method.icon} text-gray-500 mr-2`}></i>
                  <span className="text-gray-800">{method.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Credit Card Form */}
      {selectedPaymentMethod === 'card' && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Card Details</h3>
          
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <i className="far fa-credit-card text-gray-400"></i>
                </div>
              </div>
            </div>
            
            <div>
              <label
                htmlFor="cardName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cardholder Name *
              </label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={paymentData.cardName}
                onChange={handlePaymentChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Expiry Date (MM/YY) *
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handlePaymentChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>
              
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <i className="fas fa-question-circle text-gray-400 cursor-help" title="3-4 digit security code on the back of your card"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="payment.saveCard"
                  checked={paymentData.saveCard}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <span className="ml-2 text-gray-700 text-sm">
                  Save this card for future purchases
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Money Form */}
      {selectedPaymentMethod === 'mobilemoney' && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Mobile Money Details</h3>
          
          <div className="space-y-4">
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="07X XXX XXXX"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <i className="fas fa-mobile-alt text-gray-400"></i>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                You'll receive a payment prompt on this number
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* PayPal Information */}
      {selectedPaymentMethod === 'paypal' && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-center py-4">
            <i className="fab fa-paypal text-blue-500 text-4xl mb-2"></i>
            <p className="text-gray-700">
              You'll be redirected to PayPal to complete your purchase securely.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              PayPal accepts all major credit cards and bank transfers.
            </p>
          </div>
        </div>
      )}
      
      {/* Cash on Delivery Information */}
      {selectedPaymentMethod === 'cod' && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <i className="fas fa-info-circle text-sky-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-700">Cash on Delivery</h3>
              <p className="text-sm text-gray-500">
                Pay with cash when your order is delivered. Please have the exact amount ready.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Note: Additional fee may apply for cash on delivery orders.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Secure Payment Notice */}
      <div className="mt-6 flex items-center text-sm text-gray-500">
        <i className="fas fa-lock mr-2"></i>
        <span>
          Your payment information is secure. We use industry-standard encryption to protect your data.
        </span>
      </div>
    </div>
  );
};

export default PaymentForm;