import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon, KeyIcon, ExclamationCircleIcon, } from "@heroicons/react/24/outline";
import customerApi from "../../utils/customerApi";
import { showToast } from "../ui/ToastProvider";
// CustomerPasswordModal component
const CustomerPasswordModal = ({ isOpen, onClose, customerId, }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    // Reset form on close
    const handleClose = () => {
        setPassword("");
        setConfirmPassword("");
        setError("");
        onClose();
    };
    // Validate form
    const validateForm = () => {
        if (!password) {
            setError("Password is required");
            return false;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        setError("");
        return true;
    };
    // Update customer password
    const updatePassword = async () => {
        if (!validateForm())
            return;
        setIsLoading(true);
        try {
            await customerApi.updateCustomerPassword(customerId, { password });
            showToast.success("Customer password updated successfully");
            handleClose();
        }
        catch (err) {
            console.error("Error updating password:", err);
            setError(err.response?.data?.message || "Failed to update password");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Transition, { appear: true, show: isOpen, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-10", onClose: handleClose, children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-25" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4 text-center", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsxs(Dialog.Panel, { className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all", children: [_jsx("div", { className: "absolute top-0 right-0 pt-4 pr-4", children: _jsxs("button", { type: "button", className: "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2", onClick: handleClose, children: [_jsx("span", { className: "sr-only", children: "Close" }), _jsx(XMarkIcon, { className: "h-6 w-6", "aria-hidden": "true" })] }) }), _jsxs(Dialog.Title, { as: "h3", className: "text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center", children: [_jsx(KeyIcon, { className: "h-5 w-5 mr-2 text-sky-500" }), "Update Customer Password"] }), _jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Enter a new password for this customer. The customer will be able to use this password to log in to their account." }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm", children: _jsxs("div", { className: "flex", children: [_jsx(ExclamationCircleIcon, { className: "h-5 w-5 text-red-400 mr-2" }), _jsx("span", { children: error })] }) })), _jsxs("form", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "New Password" }), _jsx("input", { type: "password", id: "password", name: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", placeholder: "Enter new password" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password" }), _jsx("input", { type: "password", id: "confirmPassword", name: "confirmPassword", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", placeholder: "Confirm new password" })] })] })] }), _jsxs("div", { className: "mt-6 flex justify-end space-x-3", children: [_jsx("button", { type: "button", onClick: handleClose, className: "inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", children: "Cancel" }), _jsxs("button", { type: "button", onClick: updatePassword, disabled: isLoading, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", children: [isLoading ? (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })) : null, "Update Password"] })] })] }) }) }) })] }) }));
};
export default CustomerPasswordModal;
