import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/auth/AuthPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPassword';
import { useAuth } from '../../context/AuthContext';
var AuthMode;
(function (AuthMode) {
    AuthMode["LOGIN"] = "login";
    AuthMode["REGISTER"] = "register";
    AuthMode["FORGOT_PASSWORD"] = "forgot-password";
})(AuthMode || (AuthMode = {}));
const AuthPage = () => {
    const [authMode, setAuthMode] = useState(AuthMode.LOGIN);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log('AuthPage: User is already authenticated, redirecting');
            if (user?.isStaff) {
                console.log('AuthPage: Redirecting staff user to dashboard');
                navigate('/dashboard');
            }
            else {
                console.log('AuthPage: Redirecting regular user to account');
                navigate('/account');
            }
        }
    }, [isAuthenticated, user, navigate]);
    // Function to switch between auth modes
    const switchAuthMode = (mode) => {
        setAuthMode(mode);
    };
    // Render the appropriate form based on the current auth mode
    const renderAuthForm = () => {
        switch (authMode) {
            case AuthMode.LOGIN:
                return (_jsx(LoginForm, { onSwitchToRegister: () => switchAuthMode(AuthMode.REGISTER), onSwitchToForgotPassword: () => switchAuthMode(AuthMode.FORGOT_PASSWORD) }));
            case AuthMode.REGISTER:
                return (_jsx(RegisterForm, { onSwitchToLogin: () => switchAuthMode(AuthMode.LOGIN) }));
            case AuthMode.FORGOT_PASSWORD:
                return (_jsx(ForgotPasswordForm, { onSwitchToLogin: () => switchAuthMode(AuthMode.LOGIN) }));
            default:
                return _jsx(LoginForm, { onSwitchToRegister: () => switchAuthMode(AuthMode.REGISTER), onSwitchToForgotPassword: () => switchAuthMode(AuthMode.FORGOT_PASSWORD) });
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-sky-50 flex flex-col justify-center items-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Fast Shopping" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Your one-stop shop for the best deals" })] }), _jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: renderAuthForm() })] }) }));
};
export default AuthPage;
