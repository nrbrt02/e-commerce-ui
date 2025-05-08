import React from 'react';
import { Link } from 'react-router-dom';

interface OrderCompleteProps {
  order: {
    orderNumber?: string;
    email?: string;
    subtotal?: number;
    shipping?: number;
    tax?: number;
    total?: number;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    paymentMethod?: string;
    paymentStatus?: string;
    createdAt?: string;
    estimatedDelivery?: string;
  };
  onContinueShopping?: () => void;
}
const OrderComplete: React.FC<OrderCompleteProps> = ({ order }) => {
  // Check if order exists to prevent errors
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-yellow-100 text-yellow-800 rounded-lg p-4 mb-4">
          <p className="font-medium">Order information unavailable</p>
        </div>
        <Link 
          to="/" 
          className="px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
        >
          Return to Home
        </Link>
      </div>
    );
  }
  
  // Format currency in Rwandan Francs
  const formatCurrency = (amount: number) => {
    // Check if amount is a valid number, otherwise default to 0
    const validAmount = isNaN(amount) ? 0 : amount;
    // Format as Rwandan Francs (RWF) without division by 100
    return `${validAmount.toLocaleString()} RWF`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Processing';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    let icon = 'fa-info-circle';
    let label = 'Pending';
    
    switch (status) {
      case 'paid':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = 'fa-check-circle';
        label = 'Paid';
        break;
      case 'authorized':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = 'fa-check-circle';
        label = 'Authorized';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = 'fa-clock';
        label = 'Pending';
        break;
      case 'failed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = 'fa-times-circle';
        label = 'Failed';
        break;
      case 'cancelled':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = 'fa-ban';
        label = 'Cancelled';
        break;
      case 'refunded':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        icon = 'fa-undo';
        label = 'Refunded';
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        <i className={`fas ${icon} mr-1`}></i>
        {label}
      </span>
    );
  };
  
  // Get payment method icon and text with safe fallbacks
  const getPaymentMethodInfo = () => {
    if (!order || !order.paymentMethod) {
      return {
        icon: 'fa-money-bill',
        text: 'Payment'
      };
    }
    
    switch (order.paymentMethod) {
      case 'paypal':
        return {
          icon: 'fa-paypal',
          text: 'PayPal'
        };
      case 'credit_card':
        return {
          icon: 'fa-credit-card',
          text: 'Credit Card'
        };
      case 'bank_transfer':
        return {
          icon: 'fa-university',
          text: 'Bank Transfer'
        };
      case 'cash_on_delivery':
        return {
          icon: 'fa-money-bill-wave',
          text: 'Cash on Delivery'
        };
      default:
        return {
          icon: 'fa-money-bill',
          text: 'Payment'
        };
    }
  };

  const paymentInfo = getPaymentMethodInfo();
  const paymentStatus = order.paymentStatus || 'pending';
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Order completed message */}
      <div className="text-center py-8">
        <div className="bg-green-100 text-green-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-check-circle text-3xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600">Your order has been received and is being processed.</p>
      </div>
      
      {/* Order details card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap -mx-3">
          {/* Order number */}
          <div className="w-full md:w-1/2 px-3 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Order Number</h3>
            <p className="text-lg font-bold text-gray-900">{order.orderNumber || 'Processing'}</p>
          </div>
          
          {/* Order date */}
          <div className="w-full md:w-1/2 px-3 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Order Date</h3>
            <p className="text-lg font-bold text-gray-900">
              {order.createdAt ? formatDate(order.createdAt) : 'Processing'}
            </p>
          </div>
          
          {/* Payment method */}
          <div className="w-full md:w-1/2 px-3 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
            <p className="flex items-center text-lg font-bold text-gray-900">
              <i className={`fas ${paymentInfo.icon} mr-2 text-gray-600`}></i>
              {paymentInfo.text}
            </p>
          </div>
          
          {/* Payment status */}
          <div className="w-full md:w-1/2 px-3 mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
            <div className="flex items-center">
              {getPaymentStatusBadge(paymentStatus)}
              {paymentStatus === 'pending' && order.paymentMethod === 'bank_transfer' && (
                <span className="ml-2 text-sm text-gray-600">
                  Please complete your bank transfer
                </span>
              )}
            </div>
          </div>
          
          {/* Estimated delivery */}
          {order.estimatedDelivery && (
            <div className="w-full px-3 mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Delivery</h3>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(order.estimatedDelivery)}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Order summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
        
        {/* Order items */}
        {order.items && order.items.length > 0 && (
          <div className="mb-4">
            <div className="border-b border-gray-200 pb-2 mb-3">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Product</span>
                <span>Total</span>
              </div>
            </div>
            
            {order.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right font-medium text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Order totals */}
        <div className="pt-2">
          <div className="flex justify-between py-2 text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm text-gray-600">
            <span>Shipping</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.shipping || 0)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm text-gray-600">
            <span>Tax</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.tax || 0)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-200 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.total || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Next steps */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h2>
        <div className="text-gray-600">
          <p className="mb-3">
            We're preparing your order for shipping. You will receive an email confirmation with tracking information once your order has been shipped.
          </p>
          
          {order.paymentMethod === 'bank_transfer' && paymentStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Complete Your Payment</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Please make your bank transfer using the details below. Your order will be processed once we receive your payment.
              </p>
              <div className="bg-white p-3 rounded-md border border-yellow-200 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Bank Name:</div>
                  <div className="font-medium">Example Bank</div>
                  
                  <div className="text-gray-500">Account Name:</div>
                  <div className="font-medium">Your Store Name</div>
                  
                  <div className="text-gray-500">Account Number:</div>
                  <div className="font-medium">1234567890</div>
                  
                  <div className="text-gray-500">Routing Number:</div>
                  <div className="font-medium">987654321</div>
                  
                  <div className="text-gray-500">Reference:</div>
                  <div className="font-medium">{order.orderNumber}</div>
                </div>
              </div>
            </div>
          )}
          
          <p className="mb-3">
            If you have any questions about your order, please don't hesitate to contact our customer service team.
          </p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        <Link 
          to="/account/orders" 
          className="px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
        >
          View My Orders
        </Link>
        <Link 
          to="/" 
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderComplete;