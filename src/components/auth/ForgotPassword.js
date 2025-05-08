import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/auth/ForgotPassword.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../ui/ToastProvider';
const ForgotPassword = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { error, clearError } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearError();
        try {
            // Here you would call your password reset API
            // For now we'll just simulate a successful request
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // Show success toast
            showToast.success('Password reset instructions have been sent to your email address.');
            // Clear the form
            setEmail('');
            // Switch to login after a short delay
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        }
        catch (err) {
            console.error('Password reset request failed:', err);
            showToast.error('Failed to send reset instructions. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Reset your password" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 text-red-700 rounded-md", children: error })), _jsx("p", { className: "mb-4 text-gray-600", children: "Enter your email address and we'll send you instructions to reset your password." }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 bg-white border border-gray-300 rounded-md \n                     focus:outline-none focus:ring-2 focus:ring-sky-500", placeholder: "your@email.com", required: true, disabled: isSubmitting })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: `w-full py-2 px-4 rounded-md text-white font-medium 
                   ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`, children: isSubmitting ? 'Sending...' : 'Send Reset Instructions' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Remember your password?", ' ', _jsx("button", { type: "button", onClick: onSwitchToLogin, className: "text-sky-600 hover:text-sky-800 font-medium", disabled: isSubmitting, children: "Sign In" })] }) })] }));
};
export default ForgotPassword;
