import React, { useState } from 'react';
import PayPalPayment from './PayPalPayment';

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const CheckoutPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal'>('credit-card');
  const [loading, setLoading] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Mock order summary data
  const orderSummary: OrderSummary = {
    subtotal: 129.99,
    shipping: 4.99,
    tax: 13.50,
    total: 148.48,
  };

  const handlePaymentMethodChange = (method: 'credit-card' | 'paypal') => {
    setPaymentMethod(method);
  };

  const handlePayPalSuccess = async (details: any) => {
    console.log('PayPal payment successful:', details);
    setLoading(true);
    
    try {
      // Here you would normally send the payment details to your backend
      // For demo purposes, we're just simulating a successful order
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrderComplete(true);
      setOrderId(details.id || 'DEMO-ORDER-123');
    } catch (error) {
      console.error('Error processing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment error:', error);
    // Handle payment error (show error message, etc.)
  };

  const handlePayPalCancel = () => {
    console.log('PayPal payment cancelled by user');
    // Handle payment cancellation
  };

  const handleCreditCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate credit card processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOrderComplete(true);
      setOrderId('DEMO-CC-ORDER-456');
    } catch (error) {
      console.error('Error processing credit card:', error);
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete && orderId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Order Successful!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase. Your order number is: <span className="font-semibold">{orderId}</span></p>
          <p className="text-gray-600 mb-6">You will receive an email confirmation shortly.</p>
          <button 
            className="bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 transition duration-200"
            onClick={() => window.location.href = '/'}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Customer & Shipping */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  id="address" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  id="city" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input 
                  type="text" 
                  id="zipCode" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4">Payment Method</h2>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                type="button"
                className={`flex items-center justify-center border ${paymentMethod === 'credit-card' ? 'border-sky-500 bg-sky-50' : 'border-gray-300'} rounded-md px-4 py-2`}
                onClick={() => handlePaymentMethodChange('credit-card')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Credit Card</span>
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center border ${paymentMethod === 'paypal' ? 'border-sky-500 bg-sky-50' : 'border-gray-300'} rounded-md px-4 py-2`}
                onClick={() => handlePaymentMethodChange('paypal')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#003087">
                  <path d="M20.067 8.478c.492.506.784 1.229.784 2.024 0 1.448-.892 2.662-2.175 3.162.43.52.685 1.176.685 1.886 0 1.145-.645 2.1-1.525 2.652-.125.099-.422.3-1.007.3H12.1c-.253 0-.46-.206-.46-.46V9.082c0-.253.207-.46.46-.46h2.727v-.003c.467 0 .847.382.847.848 0 .467-.38.85-.847.85-.253 0-.348-.044-.348-.044s-2.25 0-2.604 0c-.216 0-.413.17-.455.412-.004.033-.4.212-.4.256 0 .283.223.484.49.484h2.57c.403 0 .753.188.753.688 0 .36-.165.63-.404.778-.148.088-.35.138-.566.138-.186 0-.607-.04-.607-.04s-2.309 0-2.607 0c-.215 0-.412.172-.455.412-.003.034-.003.21-.003.254 0 .285.222.486.49.486h2.575c1.45 0 2.683-1.04 2.894-2.447.332-2.194-1.08-3.245-1.08-3.245s.152-.016.264-.03c1.222-.192 2.058-1.247 2.058-2.47 0-.076-.012-.15-.022-.224h1.5c.136 0 .266.06.355.164zM8.938 18.502H7.761c-.253 0-.46-.206-.46-.46V9.086c0-.254.207-.46.46-.46h3.137c1.881 0 3.338 1.519 3.235 3.322-.103 1.803-1.604 3.313-3.512 3.318h-1.222c-.23 0-.46.23-.46.46v2.316c0 .253-.207.46-.46.46h-.001zm-.236-8.55v2.48H9.84c.677 0 1.236-.591 1.236-1.24 0-.65-.56-1.24-1.236-1.24H8.702z"/>
                </svg>
                <span>PayPal</span>
              </button>
            </div>
            
            {paymentMethod === 'credit-card' ? (
              <form onSubmit={handleCreditCardSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                    <input 
                      type="text" 
                      id="cardName" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input 
                      type="text" 
                      id="cardNumber" 
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        id="expiry" 
                        placeholder="MM/YY"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input 
                        type="text" 
                        id="cvv" 
                        placeholder="XXX"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition duration-200 disabled:bg-sky-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </form>
            ) : (
              <PayPalPayment 
                amount={orderSummary.total}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
              />
            )}
          </div>
        </div>
        
        {/* Right column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${orderSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${orderSummary.shipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${orderSummary.tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-semibold">${orderSummary.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">Free shipping on orders over $100</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-sm text-gray-700">Secure payment processing</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="text-sm text-gray-700">30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;