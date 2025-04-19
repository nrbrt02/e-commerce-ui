// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  variant?: string;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem, navigateToCart?: boolean) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  isCartDropdownOpen: boolean;
  openCartDropdown: () => void;
  closeCartDropdown: () => void;
  toggleCartDropdown: () => void;
  itemCount: number;
  totalAmount: number;
  totalSavings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('fastShoppingCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fastShoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (newItem: CartItem, navigateToCart = false) => {
    setCartItems(prev => {
      // Check if item already exists in cart
      const existingItemIndex = prev.findIndex(item => item.id === newItem.id && 
        (newItem.variant ? item.variant === newItem.variant : true));
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: Math.min(existingItem.quantity + newItem.quantity, existingItem.stock)
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prev, newItem];
      }
    });
    
    // Handle cart dropdown state based on intention
    if (!navigateToCart) {
      // Open cart dropdown when item is added (unless we're navigating to cart)
      setIsCartDropdownOpen(true);
      
      // Auto close dropdown after 3 seconds
      setTimeout(() => {
        setIsCartDropdownOpen(false);
      }, 3000);
    } else {
      // For "Buy Now", we'll handle navigation in the component
      // that calls this function with the navigate hook
      setIsCartDropdownOpen(false);
    }
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };
  
  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const openCartDropdown = () => {
    setIsCartDropdownOpen(true);
  };
  
  const closeCartDropdown = () => {
    setIsCartDropdownOpen(false);
  };
  
  const toggleCartDropdown = () => {
    setIsCartDropdownOpen(prev => !prev);
  };
  
  // Calculate totals
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  
  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isCartDropdownOpen,
    openCartDropdown,
    closeCartDropdown,
    toggleCartDropdown,
    itemCount,
    totalAmount,
    totalSavings
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};