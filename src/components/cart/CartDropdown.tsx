// src/components/cart/CartDropdown.tsx
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../../context/CartContext';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
}

const CartDropdown: React.FC<CartDropdownProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeItem
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      <div className="p-4 bg-sky-50 border-b border-sky-100 flex justify-between items-center">
        <h3 className="font-medium text-sky-800">
          Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close cart"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="text-gray-400 text-5xl mb-3">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <p className="text-gray-500 mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-400 mb-4">Add items to your cart to see them here</p>
            <button 
              onClick={onClose}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors duration-150 flex items-center">
              <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                {item.variant && (
                  <p className="text-xs text-gray-500">{item.variant}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 text-gray-500 hover:text-sky-600"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-gray-500 hover:text-sky-600"
                      aria-label="Increase quantity"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Rwf{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => removeItem(item.id)}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                aria-label="Remove item"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-800">Rwf{subtotal.toLocaleString()}</span>
          </div>
          
          <Link 
            to="/cart" 
            onClick={onClose}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-sky-700 transition-colors duration-200"
          >
            View Cart & Checkout
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
          
          <button 
            onClick={onClose}
            className="w-full mt-2 text-sky-600 hover:text-sky-800 text-sm"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDropdown;