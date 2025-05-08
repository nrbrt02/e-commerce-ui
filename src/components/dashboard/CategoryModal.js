import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { PencilIcon, PhotoIcon, XMarkIcon, CheckIcon, ExclamationCircleIcon, ArrowPathIcon, FolderIcon } from "@heroicons/react/24/outline";
const CategoryModal = ({ isOpen, onClose, mode, category, onSubmit, categories, }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
        parentId: null,
        isActive: true,
        order: 0,
    });
    const [errors, setErrors] = useState({});
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState({});
    // Initialize form data when category changes
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                description: category.description || "",
                image: category.image || "",
                parentId: category.parentId || null,
                isActive: category.isActive !== undefined ? category.isActive : true,
                order: category.order || 0,
            });
            // Reset states
            setErrors({});
            setTouched({});
            setImagePreviewError(false);
        }
    }, [category]);
    // Mark field as touched
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
    };
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checkbox = e.target;
            setFormData({ ...formData, [name]: checkbox.checked });
        }
        else if (name === "order") {
            setFormData({ ...formData, [name]: parseInt(value) || 0 });
        }
        else if (name === "image") {
            setFormData({ ...formData, [name]: value });
            setImagePreviewError(false);
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
        // Clear error for this field when it changes
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };
    // Handle image error
    const handleImageError = () => {
        setImagePreviewError(true);
    };
    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "Category name is required";
        }
        else if (formData.name.trim().length < 3) {
            newErrors.name = "Category name must be at least 3 characters";
        }
        if (formData.image && !formData.image.match(/^(https?:\/\/)/)) {
            newErrors.image = "Image URL must start with http:// or https://";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            const categoryData = {
                ...formData,
                id: mode === "edit" ? category.id : undefined,
            };
            await onSubmit(categoryData);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity", "aria-hidden": "true", children: _jsx("div", { className: "absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm", onClick: onClose }) }), _jsx("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true", children: "\u200B" }), _jsxs("div", { className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [_jsx("div", { className: "absolute top-0 right-0 pt-4 pr-4", children: _jsxs("button", { type: "button", className: "bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", onClick: onClose, children: [_jsx("span", { className: "sr-only", children: "Close" }), _jsx(XMarkIcon, { className: "h-6 w-6" })] }) }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: _jsxs("div", { className: "sm:flex sm:items-start", children: [_jsx("div", { className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-sky-100 sm:mx-0 sm:h-10 sm:w-10", children: mode === "create" ? (_jsx(FolderIcon, { className: "h-6 w-6 text-sky-600" })) : (_jsx(PencilIcon, { className: "h-6 w-6 text-sky-600" })) }), _jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: mode === "create" ? "Add New Category" : "Edit Category" }), _jsx("div", { className: "mt-6 space-y-6", children: _jsxs("div", { children: [_jsxs("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: ["Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "mt-1 relative rounded-md shadow-sm", children: [_jsx("input", { type: "text", name: "name", id: "name", className: `block w-full pr-10 ${touched.name && errors.name
                                                                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                                                                : 'border-gray-300 focus:ring-sky-500 focus:border-sky-500'} rounded-md shadow-sm py-2 px-3 sm:text-sm`, value: formData.name, onChange: handleChange, onBlur: handleBlur, placeholder: "e.g. Electronics, Clothing, Books" }), touched.name && errors.name && (_jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: _jsx(ExclamationCircleIcon, { className: "h-5 w-5 text-red-500", "aria-hidden": "true" }) })), touched.name && errors.name && (_jsx("p", { className: "mt-2 text-sm text-red-600", id: "name-error", children: errors.name }))] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("div", { className: "mt-1", children: _jsx("textarea", { name: "description", id: "description", rows: 3, className: "shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2", value: formData.description, onChange: handleChange, onBlur: handleBlur, placeholder: "Provide a brief description of this category" }) }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Brief description to help customers understand what products can be found in this category." })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { htmlFor: "parentId", className: "block text-sm font-medium text-gray-700", children: "Parent Category" }), _jsxs("select", { name: "parentId", id: "parentId", className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.parentId || "", onChange: handleChange, onBlur: handleBlur, children: [_jsx("option", { value: "", children: "None (Top Level Category)" }), categories
                                                                                    .filter(cat => mode === "create" || cat.id !== category.id) // Don't allow selecting self as parent
                                                                                    .map(category => (_jsx("option", { value: category.id, children: category.name }, category.id)))] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Leave empty to create a top-level category" })] }), _jsxs("div", { className: "mt-6", children: [_jsx("label", { htmlFor: "image", className: "block text-sm font-medium text-gray-700", children: "Image URL" }), _jsxs("div", { className: "mt-1 flex rounded-md shadow-sm", children: [_jsx("span", { className: "inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm", children: _jsx(PhotoIcon, { className: "h-4 w-4" }) }), _jsx("input", { type: "text", name: "image", id: "image", className: `focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm ${touched.image && errors.image ? 'border-red-300' : 'border-gray-300'}`, placeholder: "https://example.com/image.jpg", value: formData.image, onChange: handleChange, onBlur: handleBlur })] }), touched.image && errors.image && (_jsx("p", { className: "mt-2 text-sm text-red-600", id: "image-error", children: errors.image })), formData.image && !imagePreviewError && (_jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Preview:" }), _jsx("div", { className: "relative border border-gray-200 rounded-md p-2 bg-gray-50", children: _jsx("img", { src: formData.image, alt: "Category preview", className: "h-32 mx-auto object-contain", onError: handleImageError }) })] })), formData.image && imagePreviewError && (_jsx("div", { className: "mt-2", children: _jsxs("p", { className: "text-sm text-yellow-600 flex items-center", children: [_jsx(ExclamationCircleIcon, { className: "h-5 w-5 mr-1 text-yellow-500" }), "Unable to load preview image"] }) }))] }), _jsxs("div", { className: "mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6", children: [_jsxs("div", { className: "sm:col-span-3", children: [_jsx("label", { htmlFor: "order", className: "block text-sm font-medium text-gray-700", children: "Display Order" }), _jsx("div", { className: "mt-1", children: _jsx("input", { type: "number", name: "order", id: "order", min: "0", className: "shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3", value: formData.order, onChange: handleChange, onBlur: handleBlur }) }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Lower numbers appear first" })] }), _jsx("div", { className: "sm:col-span-3", children: _jsxs("div", { className: "flex items-start mt-7", children: [_jsx("div", { className: "flex items-center h-5", children: _jsx("input", { id: "isActive", name: "isActive", type: "checkbox", className: "focus:ring-sky-500 h-4 w-4 text-sky-600 border-gray-300 rounded", checked: formData.isActive, onChange: handleChange }) }), _jsxs("div", { className: "ml-3 text-sm", children: [_jsx("label", { htmlFor: "isActive", className: "font-medium text-gray-700", children: "Active" }), _jsx("p", { className: "text-gray-500", children: "Visible to customers" })] })] }) })] })] }) })] })] }) }), _jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "submit", className: `w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50`, disabled: isSubmitting, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(ArrowPathIcon, { className: "animate-spin -ml-1 mr-2 h-5 w-5 text-white" }), mode === "create" ? "Creating..." : "Saving..."] })) : (_jsx(_Fragment, { children: mode === "create" ? (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "-ml-1 mr-2 h-5 w-5" }), "Create Category"] })) : (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "-ml-1 mr-2 h-5 w-5" }), "Save Changes"] })) })) }), _jsx("button", { type: "button", onClick: onClose, className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm", disabled: isSubmitting, children: "Cancel" })] })] })] })] }) }));
};
export default CategoryModal;
