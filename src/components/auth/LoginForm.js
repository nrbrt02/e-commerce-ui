import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/auth/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
const LoginForm = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isStaff, setIsStaff] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearError();
        try {
            console.log('Attempting login with:', { email, password, isStaff });
            // Wait for the login to complete - now using boolean return value
            const isSuccess = await login(email, password, isStaff);
            // Clear form
            setEmail('');
            setPassword('');
            // Only navigate if login was successful
            if (isSuccess) {
                console.log('Login successful, navigating user based on role');
                // Using setTimeout to ensure state updates have propagated
                setTimeout(() => {
                    if (isStaff) {
                        console.log('Navigating staff user to dashboard');
                        navigate('/dashboard');
                    }
                    else {
                        console.log('Navigating regular user to account page');
                        navigate('/account');
                    }
                }, 500); // Increased timeout to give more time for auth state to update
            }
        }
        catch (err) {
            // Error handling is done by AuthContext
            console.error('Login failed:', err);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Login to your account" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 text-red-700 rounded-md", children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-3 py-2 bg-white border border-gray-300 rounded-md \n                     focus:outline-none focus:ring-2 focus:ring-sky-500", placeholder: "your@email.com", required: true, disabled: isSubmitting })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("button", { type: "button", onClick: onSwitchToForgotPassword, className: "text-xs text-sky-600 hover:text-sky-800", disabled: isSubmitting, children: "Forgot password?" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? "text" : "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 bg-white border border-gray-300 rounded-md \n                       focus:outline-none focus:ring-2 focus:ring-sky-500", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, disabled: isSubmitting }), _jsxs("button", { type: "button", onClick: togglePasswordVisibility, className: "absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-sky-600", tabIndex: -1, disabled: isSubmitting, children: [showPassword ? (_jsx(EyeOffIcon, { className: "w-5 h-5", "aria-hidden": "true" })) : (_jsx(EyeIcon, { className: "w-5 h-5", "aria-hidden": "true" })), _jsx("span", { className: "sr-only", children: showPassword ? 'Hide password' : 'Show password' })] })] })] }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "isStaff", checked: isStaff, onChange: () => setIsStaff(!isStaff), className: "h-4 w-4 text-sky-600 border-gray-300 rounded \n                       focus:ring-sky-500", disabled: isSubmitting }), _jsx("label", { htmlFor: "isStaff", className: "ml-2 block text-sm text-gray-700", children: "Login as Staff/Admin" })] }) }), _jsx("button", { type: "submit", disabled: isSubmitting, className: `w-full py-2 px-4 rounded-md text-white font-medium 
                   ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`, children: isSubmitting ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx("button", { type: "button", onClick: onSwitchToRegister, className: "text-sky-600 hover:text-sky-800 font-medium", disabled: isSubmitting, children: "Sign Up" })] }) })] }));
};
export default LoginForm;
