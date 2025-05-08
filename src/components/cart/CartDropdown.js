import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/cart/CartDropdown.tsx
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
const CartDropdown = ({ isOpen, onClose, cartItems, updateQuantity, removeItem }) => {
    const dropdownRef = useRef(null);
    // Calculate cart totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    if (!isOpen)
        return null;
    return (_jsxs("div", { ref: dropdownRef, className: "absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden", style: { maxHeight: 'calc(100vh - 150px)' }, children: [_jsxs("div", { className: "p-4 bg-sky-50 border-b border-sky-100 flex justify-between items-center", children: [_jsxs("h3", { className: "font-medium text-sky-800", children: ["Your Cart (", itemCount, " ", itemCount === 1 ? 'item' : 'items', ")"] }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700", "aria-label": "Close cart", children: _jsx("i", { className: "fas fa-times" }) })] }), _jsx("div", { className: "divide-y divide-gray-100 max-h-80 overflow-y-auto", children: cartItems.length === 0 ? (_jsxs("div", { className: "py-8 px-4 text-center", children: [_jsx("div", { className: "text-gray-400 text-5xl mb-3", children: _jsx("i", { className: "fas fa-shopping-cart" }) }), _jsx("p", { className: "text-gray-500 mb-2", children: "Your cart is empty" }), _jsx("p", { className: "text-sm text-gray-400 mb-4", children: "Add items to your cart to see them here" }), _jsx("button", { onClick: onClose, className: "bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200", children: "Continue Shopping" })] })) : (cartItems.map(item => (_jsxs("div", { className: "p-3 hover:bg-gray-50 transition-colors duration-150 flex items-center", children: [_jsx("div", { className: "w-16 h-16 rounded-md border border-gray-200 overflow-hidden flex-shrink-0", children: _jsx("img", { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "ml-3 flex-grow", children: [_jsx("p", { className: "text-sm font-medium text-gray-800 line-clamp-1", children: item.name }), item.variant && (_jsx("p", { className: "text-xs text-gray-500", children: item.variant })), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("div", { className: "flex items-center border border-gray-200 rounded-md", children: [_jsx("button", { onClick: () => updateQuantity(item.id, Math.max(1, item.quantity - 1)), className: "px-2 py-1 text-gray-500 hover:text-sky-600", disabled: item.quantity <= 1, "aria-label": "Decrease quantity", children: _jsx("i", { className: "fas fa-minus text-xs" }) }), _jsx("span", { className: "px-2 text-sm", children: item.quantity }), _jsx("button", { onClick: () => updateQuantity(item.id, item.quantity + 1), className: "px-2 py-1 text-gray-500 hover:text-sky-600", "aria-label": "Increase quantity", children: _jsx("i", { className: "fas fa-plus text-xs" }) })] }), _jsxs("div", { className: "text-sm font-medium text-gray-800", children: ["Rwf", (item.price * item.quantity).toLocaleString()] })] })] }), _jsx("button", { onClick: () => removeItem(item.id), className: "ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200", "aria-label": "Remove item", children: _jsx("i", { className: "fas fa-trash-alt" }) })] }, item.id)))) }), cartItems.length > 0 && (_jsxs("div", { className: "p-4 bg-white border-t border-gray-100", children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsx("span", { className: "text-gray-600", children: "Subtotal:" }), _jsxs("span", { className: "font-semibold text-gray-800", children: ["Rwf", subtotal.toLocaleString()] })] }), _jsxs(Link, { to: "/cart", onClick: onClose, className: "w-full bg-sky-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-sky-700 transition-colors duration-200", children: ["View Cart & Checkout", _jsx("i", { className: "fas fa-arrow-right ml-2" })] }), _jsx("button", { onClick: onClose, className: "w-full mt-2 text-sky-600 hover:text-sky-800 text-sm", children: "Continue Shopping" })] }))] }));
};
export default CartDropdown;
