import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define cart item type
export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
}

// Define context type
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, navigateToCart?: boolean) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (id: number) => boolean;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        // Handle corrupted cart data
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item: CartItem, navigateToCart: boolean = false) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item already in cart, update quantity
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        
        // Make sure we don't exceed available stock
        const newQuantity = Math.min(existingItem.quantity + item.quantity, existingItem.stock);
        
        updatedCart[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
        
        if (navigateToCart) {
          setTimeout(() => navigate('/cart'), 100);
        }
        
        return updatedCart;
      } else {
        // New item, add to cart
        if (navigateToCart) {
          setTimeout(() => navigate('/cart'), 100);
        }
        
        return [...prevCart, item];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };
  
  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Get total cart value
  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Get total number of items
  const getCartCount = (): number => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Check if item is in cart
  const isInCart = (id: number): boolean => {
    return cart.some(item => item.id === id);
  };
  
  return (
    <CartContext.Provider 
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;