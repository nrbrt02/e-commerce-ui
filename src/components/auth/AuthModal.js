import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/auth/AuthModal.tsx
import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPassword from './ForgotPassword';
const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    // If modal is not open, don't render anything
    if (!isOpen)
        return null;
    const handleSwitchToLogin = () => {
        setActiveTab('login');
    };
    const handleSwitchToRegister = () => {
        setActiveTab('register');
    };
    const handleSwitchToForgotPassword = () => {
        setActiveTab('forgot');
    };
    // Close modal when clicking on backdrop (outside modal content)
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", onClick: handleBackdropClick, children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex justify-between items-center p-4 border-b", children: [_jsxs("h1", { className: "text-xl font-semibold text-gray-800", children: [activeTab === 'login' && 'Sign In', activeTab === 'register' && 'Create Account', activeTab === 'forgot' && 'Reset Password'] }), _jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 focus:outline-none", children: _jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("div", { className: "p-6", children: [activeTab === 'login' && (_jsx(LoginForm, { onSwitchToRegister: handleSwitchToRegister, onSwitchToForgotPassword: handleSwitchToForgotPassword })), activeTab === 'register' && (_jsx(RegisterForm, { onSwitchToLogin: handleSwitchToLogin })), activeTab === 'forgot' && (_jsx(ForgotPassword, { onSwitchToLogin: handleSwitchToLogin }))] })] }) }));
};
export default AuthModal;
