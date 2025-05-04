import React from 'react';
import { Link } from 'react-router-dom';

interface OrderCompleteProps {
  order: {
    id?: string | number;
    orderNumber?: string;
    status?: string;
    shippingAddress?: any;
    shippingMethod?: string;
    paymentMethod?: string;
    items?: any[];
    subtotal?: number;
    tax?: number;
    shipping?: number;
    total?: number;
    estimatedDelivery?: string;
    createdAt?: string;
    [key: string]: any;
  };
}

const OrderComplete: React.FC<OrderCompleteProps> = ({ order }) => {
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount?: number): string => {
    if (amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-2xl text-green-500"></i>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've received your payment and will process your order shortly.
          </p>
          
          <div className="inline-block bg-gray-100 rounded-lg px-6 py-3 mb-4">
            <div className="text-left">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/account/orders"
              className="px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
            >
              <i className="fas fa-file-alt mr-2"></i>
              View Order
            </Link>
            
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              <i className="fas fa-home mr-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
          
          <div className="space-y-6">
            {/* Order information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Order Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="text-gray-800 font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-800">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {order.status || 'Processing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-800">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {order.shippingAddress ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-800">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-gray-600">{order.shippingAddress.address}</p>
                      {order.shippingAddress.address2 && (
                        <p className="text-gray-600">{order.shippingAddress.address2}</p>
                      )}
                      <p className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-600">{order.shippingAddress.country}</p>
                      <p className="text-gray-600">{order.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Shipping information not available</p>
                  )}
                  
                  {order.estimatedDelivery && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <i className="far fa-calendar-alt mr-1"></i>
                        Estimated delivery: {order.estimatedDelivery}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order summary */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* Order items */}
                {order.items && order.items.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <div key={index} className="p-4 flex">
                        {/* Item image */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <i className="fas fa-box"></i>
                            </div>
                          )}
                        </div>
                        
                        {/* Item details */}
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          {item.options && Object.keys(item.options).length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {Object.entries(item.options).map(([key, value]) => (
                                <span key={key}>{key}: {value} </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Item price */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {item.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">
                              {formatCurrency(item.originalPrice * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-gray-500 text-center">
                    <p>No items in this order</p>
                  </div>
                )}
                
                {/* Order totals */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800">{formatCurrency(order.subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-800">
                        {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800">{formatCurrency(order.tax)}</span>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-800">Total</span>
                        <span className="text-gray-900">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Next steps */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex">
                  <i className="fas fa-envelope-open mt-0.5 mr-2"></i>
                  <span>You'll receive an order confirmation email shortly.</span>
                </li>
                <li className="flex">
                  <i className="fas fa-box mt-0.5 mr-2"></i>
                  <span>We'll notify you when your order ships.</span>
                </li>
                <li className="flex">
                  <i className="fas fa-question-circle mt-0.5 mr-2"></i>
                  <span>
                    For any questions about your order, please contact our support team.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderComplete;