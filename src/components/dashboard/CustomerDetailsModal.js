import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, XMarkIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon, ClockIcon, MapPinIcon, Cog6ToothIcon, } from "@heroicons/react/24/outline";
import customerApi from "../../utils/customerApi";
import { showToast } from "../ui/ToastProvider";
// CustomerDetailsModal component
const CustomerDetailsModal = ({ isOpen, onClose, customer, }) => {
    const [editMode, setEditMode] = useState(false);
    const [updatedCustomer, setUpdatedCustomer] = useState(customer);
    const [isLoading, setIsLoading] = useState(false);
    // Format date helper function
    const formatDate = (dateString) => {
        if (!dateString)
            return "Never";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    // Get full name helper function
    const getFullName = (customer) => {
        return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username;
    };
    // Get avatar URL helper function
    const getAvatarUrl = (customer) => {
        if (customer.avatar) {
            return customer.avatar;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName(customer))}&background=0D9DE3&color=fff`;
    };
    // Toggle customer status (active/inactive)
    const toggleCustomerStatus = async () => {
        setIsLoading(true);
        try {
            // const response = await customerApi.updateCustomer(customer.id, {
            //   isActive: !updatedCustomer.isActive
            // });
            setUpdatedCustomer({
                ...updatedCustomer,
                isActive: !updatedCustomer.isActive
            });
            showToast.success(`Customer is now ${!updatedCustomer.isActive ? 'active' : 'inactive'}`);
        }
        catch (error) {
            console.error("Error updating customer status:", error);
            showToast.error(error.response?.data?.message || "Failed to update customer status");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Toggle customer verification status
    const toggleVerificationStatus = async () => {
        setIsLoading(true);
        try {
            await customerApi.updateCustomer(customer.id, {
                isVerified: !updatedCustomer.isVerified
            });
            setUpdatedCustomer({
                ...updatedCustomer,
                isVerified: !updatedCustomer.isVerified
            });
            showToast.success(`Customer is now ${!updatedCustomer.isVerified ? 'verified' : 'unverified'}`);
        }
        catch (error) {
            console.error("Error updating verification status:", error);
            showToast.error(error.response?.data?.message || "Failed to update verification status");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedCustomer({
            ...updatedCustomer,
            [name]: value
        });
    };
    // Save customer data
    const saveCustomerData = async () => {
        setIsLoading(true);
        try {
            await customerApi.updateCustomer(customer.id, {
                firstName: updatedCustomer.firstName,
                lastName: updatedCustomer.lastName,
                phone: updatedCustomer.phone,
                email: updatedCustomer.email,
                username: updatedCustomer.username
            });
            showToast.success("Customer information updated successfully");
            setEditMode(false);
        }
        catch (error) {
            console.error("Error updating customer:", error);
            showToast.error(error.response?.data?.message || "Failed to update customer information");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Transition, { appear: true, show: isOpen, as: Fragment, children: _jsxs(Dialog, { as: "div", className: "relative z-10", onClose: onClose, children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-25" }) }), _jsx("div", { className: "fixed inset-0 overflow-y-auto", children: _jsx("div", { className: "flex min-h-full items-center justify-center p-4 text-center", children: _jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: _jsxs(Dialog.Panel, { className: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all", children: [_jsx("div", { className: "absolute top-0 right-0 pt-4 pr-4", children: _jsxs("button", { type: "button", className: "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2", onClick: onClose, children: [_jsx("span", { className: "sr-only", children: "Close" }), _jsx(XMarkIcon, { className: "h-6 w-6", "aria-hidden": "true" })] }) }), _jsx(Dialog.Title, { as: "h3", className: "text-lg font-medium leading-6 text-gray-900 mb-4", children: "Customer Details" }), _jsxs("div", { className: "flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200", children: [_jsx("div", { className: "h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden", children: _jsx("img", { src: getAvatarUrl(updatedCustomer), alt: getFullName(updatedCustomer), className: "h-16 w-16 object-cover rounded-full", onError: (e) => {
                                                        e.target.src =
                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName(updatedCustomer))}&background=0D9DE3&color=fff&size=128`;
                                                    } }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-xl font-semibold", children: getFullName(updatedCustomer) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Customer ID: ", updatedCustomer.id] }), _jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [updatedCustomer.isVerified ? (_jsx("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800", children: "Verified" })) : (_jsx("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800", children: "Unverified" })), updatedCustomer.isActive ? (_jsx("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800", children: "Active" })) : (_jsx("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800", children: "Inactive" }))] })] }), _jsx("div", { className: "ml-auto", children: _jsxs("button", { type: "button", onClick: () => {
                                                        if (editMode) {
                                                            saveCustomerData();
                                                        }
                                                        else {
                                                            setEditMode(true);
                                                        }
                                                    }, disabled: isLoading, className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", children: [isLoading ? (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })) : (_jsx(PencilSquareIcon, { className: "-ml-0.5 mr-2 h-4 w-4" })), editMode ? "Save Changes" : "Edit Customer"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Personal Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Username" }), editMode ? (_jsx("input", { type: "text", name: "username", value: updatedCustomer.username, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" })) : (_jsxs("div", { className: "flex items-center", children: [_jsx(UserIcon, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm", children: updatedCustomer.username })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "First Name" }), editMode ? (_jsx("input", { type: "text", name: "firstName", value: updatedCustomer.firstName || "", onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" })) : (_jsx("div", { className: "text-sm", children: updatedCustomer.firstName || "-" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Last Name" }), editMode ? (_jsx("input", { type: "text", name: "lastName", value: updatedCustomer.lastName || "", onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" })) : (_jsx("div", { className: "text-sm", children: updatedCustomer.lastName || "-" }))] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Contact Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Email" }), editMode ? (_jsx("input", { type: "email", name: "email", value: updatedCustomer.email, onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" })) : (_jsxs("div", { className: "flex items-center", children: [_jsx(EnvelopeIcon, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm", children: updatedCustomer.email })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-500 mb-1", children: "Phone" }), editMode ? (_jsx("input", { type: "text", name: "phone", value: updatedCustomer.phone || "", onChange: handleInputChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" })) : (_jsxs("div", { className: "flex items-center", children: [_jsx(PhoneIcon, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm", children: updatedCustomer.phone || "-" })] }))] })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Account Status" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-sm font-medium text-gray-700", children: "Account Status" }), _jsx("span", { className: "block text-xs text-gray-500", children: updatedCustomer.isActive ? "Active" : "Inactive" })] }), _jsx("button", { type: "button", onClick: toggleCustomerStatus, disabled: isLoading, className: `relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${updatedCustomer.isActive ? "bg-sky-600" : "bg-gray-200"}`, children: _jsxs("span", { className: `${updatedCustomer.isActive ? "translate-x-5" : "translate-x-0"} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`, children: [_jsx("span", { className: `${updatedCustomer.isActive
                                                                                            ? "opacity-0 ease-out duration-100"
                                                                                            : "opacity-100 ease-in duration-200"} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`, "aria-hidden": "true", children: _jsx(XCircleIcon, { className: "h-3 w-3 text-gray-400" }) }), _jsx("span", { className: `${updatedCustomer.isActive
                                                                                            ? "opacity-100 ease-in duration-200"
                                                                                            : "opacity-0 ease-out duration-100"} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`, "aria-hidden": "true", children: _jsx(CheckCircleIcon, { className: "h-3 w-3 text-sky-600" }) })] }) })] }) }), _jsx("div", { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-sm font-medium text-gray-700", children: "Verification Status" }), _jsx("span", { className: "block text-xs text-gray-500", children: updatedCustomer.isVerified ? "Verified" : "Unverified" })] }), _jsx("button", { type: "button", onClick: toggleVerificationStatus, disabled: isLoading, className: `relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${updatedCustomer.isVerified ? "bg-green-600" : "bg-gray-200"}`, children: _jsxs("span", { className: `${updatedCustomer.isVerified ? "translate-x-5" : "translate-x-0"} pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`, children: [_jsx("span", { className: `${updatedCustomer.isVerified
                                                                                            ? "opacity-0 ease-out duration-100"
                                                                                            : "opacity-100 ease-in duration-200"} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`, "aria-hidden": "true", children: _jsx(XCircleIcon, { className: "h-3 w-3 text-gray-400" }) }), _jsx("span", { className: `${updatedCustomer.isVerified
                                                                                            ? "opacity-100 ease-in duration-200"
                                                                                            : "opacity-0 ease-out duration-100"} absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`, "aria-hidden": "true", children: _jsx(CheckCircleIcon, { className: "h-3 w-3 text-green-600" }) })] }) })] }) })] })] }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Account Activity" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-xs text-gray-500 mb-1", children: "Registered On" }), _jsxs("div", { className: "flex items-center", children: [_jsx(ClockIcon, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm", children: formatDate(updatedCustomer.createdAt) })] })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-xs text-gray-500 mb-1", children: "Last Login" }), _jsxs("div", { className: "flex items-center", children: [_jsx(ClockIcon, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm", children: formatDate(updatedCustomer.lastLogin) })] })] }), _jsxs("div", { children: [_jsx("span", { className: "block text-xs text-gray-500 mb-1", children: "Last Updated" }), _jsxs("div", { className: "flex items-center", children: [_jsx(ClockIcon, { className: "h-4 w-4 text-gray-400 mr-2" }), _jsx("span", { className: "text-sm", children: formatDate(updatedCustomer.updatedAt) })] })] })] })] })] }), updatedCustomer.addresses && updatedCustomer.addresses.length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-3", children: "Customer Addresses" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: updatedCustomer.addresses.map((address, index) => (_jsx("div", { className: "border border-gray-200 rounded-md p-3", children: _jsxs("div", { className: "flex items-start", children: [_jsx(MapPinIcon, { className: "h-5 w-5 text-gray-400 mr-2" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium", children: address.label || `Address ${index + 1}` }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: [
                                                                            address.street,
                                                                            address.city,
                                                                            address.state,
                                                                            address.postalCode,
                                                                            address.country,
                                                                        ]
                                                                            .filter(Boolean)
                                                                            .join(", ") }), address.isDefault && (_jsx("span", { className: "mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800", children: "Default" }))] })] }) }, index))) })] })), updatedCustomer.preferences && Object.keys(updatedCustomer.preferences).length > 0 && (_jsxs("div", { className: "mt-6", children: [_jsxs("h4", { className: "text-sm font-medium text-gray-700 mb-3 flex items-center", children: [_jsx(Cog6ToothIcon, { className: "h-4 w-4 mr-1 text-gray-500" }), "Customer Preferences"] }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg", children: _jsx("pre", { className: "text-xs text-gray-700 overflow-auto max-h-40", children: JSON.stringify(updatedCustomer.preferences, null, 2) }) })] })), _jsxs("div", { className: "mt-8 flex justify-end space-x-3", children: [editMode && (_jsx("button", { type: "button", onClick: () => {
                                                    setEditMode(false);
                                                    setUpdatedCustomer(customer); // Reset to original data
                                                }, className: "inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", children: "Cancel" })), _jsx("button", { type: "button", onClick: onClose, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", children: "Close" })] })] }) }) }) })] }) }));
};
export default CustomerDetailsModal;
