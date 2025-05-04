import React, { useState } from 'react';
import { CartItem } from '../../context/CartContext';

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
  totalSavings: number;
  shippingCost: number;
  taxAmount: number;
  totalOrderAmount: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  totalAmount,
  totalSavings,
  shippingCost,
  taxAmount,
  totalOrderAmount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSummary = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Order Summary</h2>
      </div>
      
      {/* Mobile toggle for order summary */}
      <div className="lg:hidden p-4 flex justify-between items-center cursor-pointer" onClick={toggleSummary}>
        <div className="font-medium">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} | Rwf {totalOrderAmount.toLocaleString()}
        </div>
        <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-500`}></i>
      </div>
      
      {/* Order summary content - always visible on desktop, toggleable on mobile */}
      <div className={`border-t border-gray-200 lg:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="p-4">
          {/* Item list */}
          <div className="max-h-60 overflow-y-auto mb-4">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.variant || ''}`} className="flex py-2 border-b border-gray-100 last:border-b-0">
                <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-3">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-gray-500">{item.variant}</p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm">
                      {item.quantity} x {item.originalPrice ? (
                        <span>
                          <span className="line-through text-gray-400">Rwf {item.originalPrice}</span>
                          {' '}
                          <span className="text-gray-900">Rwf {item.price}</span>
                        </span>
                      ) : (
                        <span className="text-gray-900">Rwf {item.price}</span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      Rwf {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Price breakdown */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">Rwf {totalAmount.toLocaleString()}</span>
            </div>
            
            {totalSavings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Savings</span>
                <span>-Rwf {totalSavings.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-gray-800">
                {shippingCost === 0 ? 'Free' : `Rwf ${shippingCost.toLocaleString()}`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax (18% VAT)</span>
              <span className="font-medium text-gray-800">Rwf {Math.round(taxAmount).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-medium">
              <span>Total</span>
              <span className="text-gray-900">Rwf {Math.round(totalOrderAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Promotion code (future implementation) */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Promo code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button className="absolute inset-y-0 right-0 px-3 text-sky-600 font-medium">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;