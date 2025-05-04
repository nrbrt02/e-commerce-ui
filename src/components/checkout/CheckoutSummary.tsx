import React from 'react';
import { useCheckout } from '../../context/CheckoutContenxt';

interface CheckoutSummaryProps {
  showDetails?: boolean;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ showDetails = false }) => {
  const {
    cartItems,
    totalAmount,
    totalSavings,
    shippingCost,
    taxAmount,
    totalOrderAmount,
    selectedShippingMethod,
    deliveryOptions,
  } = useCheckout();

  // Get the selected shipping method details
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
      
      {/* Show cart items if details are requested */}
      {showDetails && cartItems.length > 0 && (
        <div className="mb-4 border-b border-gray-200 pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </h3>
          
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.variant || ''}`} className="flex items-center text-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
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
                
                <div className="ml-3 flex-1">
                  <p className="text-gray-700 font-medium">{item.name}</p>
                  <p className="text-gray-500">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-700 font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  
                  {item.originalPrice && (
                    <p className="text-gray-500 line-through text-xs">
                      {formatCurrency(item.originalPrice * item.quantity)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Price summary */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-800 font-medium">{formatCurrency(totalAmount)}</span>
        </div>
        
        {totalSavings > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Savings</span>
            <span className="text-green-600 font-medium">-{formatCurrency(totalSavings)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-800 font-medium">
            {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
            {selectedShipping && showDetails && (
              <span className="block text-xs text-gray-500">{selectedShipping.name}</span>
            )}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (18%)</span>
          <span className="text-gray-800 font-medium">{formatCurrency(taxAmount)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-900">{formatCurrency(totalOrderAmount)}</span>
          </div>
        </div>
      </div>
      
      {/* Estimated delivery */}
      {selectedShipping && selectedShipping.estimatedDelivery && showDetails && (
        <div className="mt-4 text-sm">
          <p className="text-gray-600">
            <i className="fas fa-truck mr-2"></i>
            Estimated delivery: <span className="font-medium">{selectedShipping.estimatedDelivery}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckoutSummary;