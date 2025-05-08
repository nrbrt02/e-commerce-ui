import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const ProductModal = ({ isOpen, onClose, mode, productData, onProductSaved, }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        shortDescription: "",
        sku: "",
        barcode: "",
        price: 0,
        compareAtPrice: null,
        costPrice: null,
        isPublished: false,
        isFeatured: false,
        isDigital: false,
        quantity: 0,
        lowStockThreshold: null,
        weight: null,
        dimensions: null,
        tags: [],
        imageUrls: [],
        categoryIds: [],
        supplierId: user?.id ? Number(user.id) : undefined,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [activeTab, setActiveTab] = useState("basic");
    const [formErrors, setFormErrors] = useState({});
    // const isAdmin = user?.primaryRole === 'admin' || user?.primaryRole === 'superadmin';
    // const isSupplier = user?.primaryRole === 'supplier';
    const isStaff = user?.isStaff;
    // Fill form when editing an existing product
    useEffect(() => {
        if (mode === "edit" && productData) {
            setFormData({
                ...productData,
                categoryIds: productData.categoryIds || [],
                tags: productData.tags || [],
                imageUrls: productData.imageUrls || [],
            });
        }
        else {
            // For create mode, reset the form
            setFormData({
                name: "",
                description: "",
                shortDescription: "",
                sku: "",
                barcode: "",
                price: 0,
                compareAtPrice: null,
                costPrice: null,
                isPublished: false,
                isFeatured: false,
                isDigital: false,
                quantity: 0,
                lowStockThreshold: null,
                weight: null,
                dimensions: null,
                tags: [],
                imageUrls: [],
                categoryIds: [],
                supplierId: user?.id ? Number(user.id) : undefined,
            });
        }
        // Reset form state
        setTagInput("");
        setImageUrlInput("");
        setActiveTab("basic");
        setFormErrors({});
    }, [mode, productData, user?.id, isOpen]);
    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE_URL}/categories`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAvailableCategories(response.data.data.categories || []);
            }
            catch (err) {
                console.error("Error fetching categories:", err);
                setError("Failed to load categories");
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);
    const parseImageUrl = (imgUrl) => {
        try {
            if (typeof imgUrl === "string") {
                // Check if it's already a valid URL
                if (imgUrl.startsWith("http"))
                    return imgUrl;
                // Try to parse it as JSON
                const parsed = JSON.parse(imgUrl);
                return parsed.url || "";
            }
            return "";
        }
        catch (error) {
            // If parsing fails, return the original string
            return imgUrl;
        }
    };
    // Validate form
    const validateForm = useCallback(() => {
        const errors = {};
        // Required fields
        if (!formData.name.trim())
            errors.name = "Product name is required";
        if (!formData.description.trim())
            errors.description = "Description is required";
        if (!formData.sku.trim())
            errors.sku = "SKU is required";
        // Number validations
        if (Number(formData.price) < 0)
            errors.price = "Price cannot be negative";
        if (formData.quantity < 0)
            errors.quantity = "Quantity cannot be negative";
        // Use type guard to avoid TypeScript error
        if (formData.lowStockThreshold !== null &&
            formData.lowStockThreshold !== undefined &&
            formData.lowStockThreshold < 0) {
            errors.lowStockThreshold = "Threshold cannot be negative";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Clear the specific error when field is edited
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (type === "checkbox") {
            const checkbox = e.target;
            setFormData({ ...formData, [name]: checkbox.checked });
        }
        else if (name === "price" ||
            name === "compareAtPrice" ||
            name === "costPrice" ||
            name === "quantity" ||
            name === "lowStockThreshold" ||
            name === "weight") {
            // Handle numeric inputs - allow empty string for optional fields
            const numValue = value === "" ? null : parseFloat(value) || 0;
            setFormData({ ...formData, [name]: numValue });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };
    // Handle category selection
    const handleCategoryChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10));
        setFormData({ ...formData, categoryIds: selectedOptions });
    };
    // Handle dimensions changes
    const handleDimensionChange = (e) => {
        const { name, value } = e.target;
        const dimensionKey = name.split(".")[1];
        // Allow empty values for dimensions
        const dimensionValue = value === "" ? undefined : parseFloat(value) || 0;
        setFormData({
            ...formData,
            dimensions: {
                ...formData.dimensions,
                [dimensionKey]: dimensionValue,
            },
        });
    };
    // Add a tag
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...(formData.tags || []), tagInput.trim()],
            });
            setTagInput("");
        }
    };
    // Remove a tag
    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
        });
    };
    // Add an image URL
    const handleAddImageUrl = () => {
        if (imageUrlInput.trim() &&
            !formData.imageUrls?.includes(imageUrlInput.trim())) {
            // Create standard object if needed to ensure consistency
            let imageUrl = imageUrlInput.trim();
            // If not already an HTTP URL, try to format as a JSON object with url property
            if (!imageUrl.startsWith("http")) {
                try {
                    // Check if already a JSON string
                    JSON.parse(imageUrl);
                }
                catch (e) {
                    // Not JSON, so wrap it as a simple URL object
                    imageUrl = JSON.stringify({ url: imageUrl });
                }
            }
            setFormData({
                ...formData,
                imageUrls: [...(formData.imageUrls || []), imageUrl],
            });
            setImageUrlInput("");
        }
    };
    // Remove an image URL
    const handleRemoveImageUrl = (urlToRemove) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls?.filter((url) => url !== urlToRemove) || [],
        });
    };
    // Generate a random SKU
    const generateRandomSku = () => {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sku = `PROD-${randomPart}`;
        setFormData({
            ...formData,
            sku,
        });
    };
    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate form first
        if (!validateForm()) {
            // Show error message and highlight the correct tab
            const errorFields = Object.keys(formErrors);
            if (errorFields.includes("name") ||
                errorFields.includes("description") ||
                errorFields.includes("shortDescription")) {
                setActiveTab("basic");
            }
            else if (errorFields.includes("sku") ||
                errorFields.includes("price") ||
                errorFields.includes("quantity")) {
                setActiveTab("inventory");
            }
            else if (errorFields.includes("imageUrls")) {
                setActiveTab("media");
            }
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            // Prepare the product data for submission
            const productPayload = {
                name: formData.name,
                description: formData.description,
                shortDescription: formData.shortDescription,
                sku: formData.sku,
                barcode: formData.barcode,
                price: formData.price,
                compareAtPrice: formData.compareAtPrice,
                costPrice: formData.costPrice,
                isPublished: formData.isPublished,
                isFeatured: formData.isFeatured,
                isDigital: formData.isDigital,
                quantity: formData.quantity,
                lowStockThreshold: formData.lowStockThreshold,
                weight: formData.weight,
                dimensions: formData.dimensions,
                tags: formData.tags,
                categoryIds: formData.categoryIds,
                images: formData.imageUrls?.map((url) => ({ url })),
                supplierId: formData.supplierId, // Include supplierId in the payload
            };
            let savedProduct;
            if (mode === "create") {
                const response = await axios.post(`${API_BASE_URL}/products`, productPayload, { headers });
                savedProduct = response.data.data;
            }
            else {
                if (!formData.id)
                    throw new Error("Product ID required for update");
                const response = await axios.put(`${API_BASE_URL}/products/${formData.id}`, productPayload, { headers });
                savedProduct = response.data.data;
            }
            onProductSaved(savedProduct);
        }
        catch (err) {
            console.error("Error saving product:", err);
            setError(err.response?.data?.message || err.message || "Failed to save product");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Get error class for form inputs
    const getInputErrorClass = (fieldName) => {
        return formErrors[fieldName]
            ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-sky-500 focus:border-sky-500";
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", "aria-labelledby": "product-modal", role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity", "aria-hidden": "true", children: _jsx("div", { className: "absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }) }), _jsx("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true", children: "\u200B" }), _jsx("div", { className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [_jsxs("div", { className: "mb-4 flex justify-between items-center", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: mode === "create" ? "Add New Product" : "Edit Product" }), _jsxs("button", { type: "button", onClick: onClose, className: "text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", "aria-label": "Close", children: [_jsx("span", { className: "sr-only", children: "Close" }), _jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] })] }), error && (_jsx("div", { className: "mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-red-700", children: error }) }), _jsx("button", { type: "button", onClick: () => setError(null), className: "ml-auto text-red-500 hover:text-red-700", children: _jsx("svg", { className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }) })), _jsx("div", { className: "border-b border-gray-200 mb-6", children: _jsxs("nav", { className: "-mb-px flex space-x-4 md:space-x-8", "aria-label": "Tabs", children: [_jsx("button", { type: "button", onClick: () => setActiveTab("basic"), className: `${activeTab === "basic"
                                                        ? "border-sky-500 text-sky-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`, children: "Basic Info" }), _jsx("button", { type: "button", onClick: () => setActiveTab("inventory"), className: `${activeTab === "inventory"
                                                        ? "border-sky-500 text-sky-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`, children: "Inventory & Pricing" }), _jsx("button", { type: "button", onClick: () => setActiveTab("media"), className: `${activeTab === "media"
                                                        ? "border-sky-500 text-sky-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`, children: "Media & Tags" }), _jsx("button", { type: "button", onClick: () => setActiveTab("advanced"), className: `${activeTab === "advanced"
                                                        ? "border-sky-500 text-sky-600"
                                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`, children: "Advanced" })] }) }), _jsxs("div", { className: "max-h-[60vh] overflow-y-auto px-1 py-2", children: [activeTab === "basic" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: ["Product Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", name: "name", id: "name", required: true, className: `mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass("name")}`, value: formData.name, onChange: handleChange }), formErrors.name && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.name }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "shortDescription", className: "block text-sm font-medium text-gray-700", children: "Short Description" }), _jsx("input", { type: "text", name: "shortDescription", id: "shortDescription", className: `mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass("shortDescription")}`, value: formData.shortDescription, onChange: handleChange, placeholder: "Brief summary of the product" }), formErrors.shortDescription && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.shortDescription }))] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: ["Full Description ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { name: "description", id: "description", rows: 4, required: true, className: `mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass("description")}`, value: formData.description, onChange: handleChange }), formErrors.description && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.description }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "categories", className: "block text-sm font-medium text-gray-700", children: "Categories" }), _jsx("select", { name: "categories", id: "categories", multiple: true, className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.categoryIds?.map((id) => id.toString()), onChange: handleCategoryChange, size: Math.min(5, availableCategories.length), children: availableCategories.map((category) => (_jsx("option", { value: category.id, children: category.name }, category.id))) }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Hold Ctrl/Cmd to select multiple categories" })] }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Visibility Settings" }), _jsxs("div", { className: "flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("input", { id: "isPublished", name: "isPublished", type: "checkbox", className: "h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded", checked: formData.isPublished, onChange: handleChange }), _jsx("label", { htmlFor: "isPublished", className: "ml-3 text-sm text-gray-700", children: "Published" })] }), isStaff && (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { id: "isFeatured", name: "isFeatured", type: "checkbox", className: "h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded", checked: formData.isFeatured, onChange: handleChange }), _jsx("label", { htmlFor: "isFeatured", className: "ml-3 text-sm text-gray-700", children: "Featured" })] })), ";", _jsxs("div", { className: "flex items-center", children: [_jsx("input", { id: "isDigital", name: "isDigital", type: "checkbox", className: "h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded", checked: formData.isDigital, onChange: handleChange }), _jsx("label", { htmlFor: "isDigital", className: "ml-3 text-sm text-gray-700", children: "Digital Product" })] })] })] })] })), activeTab === "inventory" && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "sku", className: "block text-sm font-medium text-gray-700", children: ["SKU ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "mt-1 flex rounded-md shadow-sm", children: [_jsx("input", { type: "text", name: "sku", id: "sku", required: true, className: `flex-1 block w-full rounded-l-md sm:text-sm ${getInputErrorClass("sku")}`, value: formData.sku, onChange: handleChange }), _jsx("button", { type: "button", onClick: generateRandomSku, className: "inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100", children: "Generate" })] }), formErrors.sku && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.sku }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "barcode", className: "block text-sm font-medium text-gray-700", children: "Barcode" }), _jsx("input", { type: "text", name: "barcode", id: "barcode", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.barcode, onChange: handleChange, placeholder: "Optional" })] })] }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Pricing" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "price", className: "block text-sm font-medium text-gray-700", children: ["Regular Price", " ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "mt-1 relative rounded-md shadow-sm", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx("span", { className: "text-gray-500 sm:text-sm", children: "Rwf" }) }), _jsx("input", { type: "number", name: "price", id: "price", min: "0", step: "0.01", required: true, className: `mt-1 block w-full rounded-md shadow-sm py-2 pl-7 pr-3 sm:text-sm Rwf{getInputErrorClass(
                                "price"
                              )}`, value: formData.price || "", onChange: handleChange })] }), formErrors.price && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.price }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "compareAtPrice", className: "block text-sm font-medium text-gray-700", children: "Compare At Price" }), _jsxs("div", { className: "mt-1 relative rounded-md shadow-sm", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx("span", { className: "text-gray-500 sm:text-sm", children: "Rwf" }) }), _jsx("input", { type: "number", name: "compareAtPrice", id: "compareAtPrice", min: "0", step: "0.01", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.compareAtPrice || "", onChange: handleChange, placeholder: "Optional" })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Original price for showing discount" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "costPrice", className: "block text-sm font-medium text-gray-700", children: "Cost Price" }), _jsxs("div", { className: "mt-1 relative rounded-md shadow-sm", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx("span", { className: "text-gray-500 sm:text-sm", children: "Rwf" }) }), _jsx("input", { type: "number", name: "costPrice", id: "costPrice", min: "0", step: "0.01", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 pl-7 pr-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.costPrice || "", onChange: handleChange, placeholder: "Optional" })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Your purchase cost (not shown to customers)" })] })] })] }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Inventory" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "quantity", className: "block text-sm font-medium text-gray-700", children: ["Quantity ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "number", name: "quantity", id: "quantity", min: "0", required: true, className: `mt-1 block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${getInputErrorClass("quantity")}`, value: formData.quantity || "", onChange: handleChange }), formErrors.quantity && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.quantity }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "lowStockThreshold", className: "block text-sm font-medium text-gray-700", children: "Low Stock Threshold" }), _jsx("input", { type: "number", name: "lowStockThreshold", id: "lowStockThreshold", min: "0", className: `mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${getInputErrorClass("lowStockThreshold")}`, value: formData.lowStockThreshold || "", onChange: handleChange, placeholder: "Optional" }), formErrors.lowStockThreshold && (_jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.lowStockThreshold })), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Inventory level that triggers low stock warning" })] })] })] }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Shipping Information" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "weight", className: "block text-sm font-medium text-gray-700", children: "Weight (g)" }), _jsx("input", { type: "number", name: "weight", id: "weight", min: "0", step: "0.01", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.weight || "", onChange: handleChange, placeholder: "Optional" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Dimensions (cm)" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "dimensions.length", className: "block text-xs text-gray-500", children: "Length" }), _jsx("input", { type: "number", name: "dimensions.length", id: "dimensions.length", min: "0", step: "0.1", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.dimensions?.length || "", onChange: handleDimensionChange, placeholder: "L" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "dimensions.width", className: "block text-xs text-gray-500", children: "Width" }), _jsx("input", { type: "number", name: "dimensions.width", id: "dimensions.width", min: "0", step: "0.1", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.dimensions?.width || "", onChange: handleDimensionChange, placeholder: "W" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "dimensions.height", className: "block text-xs text-gray-500", children: "Height" }), _jsx("input", { type: "number", name: "dimensions.height", id: "dimensions.height", min: "0", step: "0.1", className: "mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm", value: formData.dimensions?.height || "", onChange: handleDimensionChange, placeholder: "H" })] })] })] })] })] })), activeTab === "media" && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "imageUrls", className: "block text-sm font-medium text-gray-700 mb-2", children: "Product Images" }), _jsxs("div", { className: "mt-1 flex rounded-md shadow-sm", children: [_jsx("input", { type: "url", name: "imageUrls", id: "imageUrls", className: "focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300", placeholder: "Enter an image URL", value: imageUrlInput, onChange: (e) => setImageUrlInput(e.target.value), onKeyPress: (e) => {
                                                                            if (e.key === "Enter") {
                                                                                e.preventDefault();
                                                                                handleAddImageUrl();
                                                                            }
                                                                        } }), _jsx("button", { type: "button", onClick: handleAddImageUrl, className: "inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100", children: "Add" })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Enter URLs for product images (JPEG, PNG, etc.)" }), formData.imageUrls && formData.imageUrls.length > 0 ? (_jsx("div", { className: "mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: formData.imageUrls.map((url, index) => (_jsxs("div", { className: "relative group rounded-md border border-gray-300 overflow-hidden", children: [_jsx("div", { className: "aspect-square bg-gray-100", children: _jsx("img", { src: parseImageUrl(url), alt: `Product image ${index + 1}`, className: "h-full w-full object-cover", onError: (e) => {
                                                                                    e.target.src =
                                                                                        "https://via.placeholder.com/150?text=Invalid+URL";
                                                                                } }) }), _jsx("div", { className: "p-2 text-xs truncate bg-white border-t border-gray-200", children: url.split("/").pop() }), _jsx("button", { type: "button", onClick: () => handleRemoveImageUrl(url), className: "absolute top-1 right-1 h-6 w-6 rounded-full bg-white bg-opacity-75 flex items-center justify-center text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500", "aria-label": "Remove image", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }, index))) })) : (_jsxs("div", { className: "mt-4 border-2 border-dashed border-gray-300 rounded-md p-6 text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "No images added yet" })] }))] }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("label", { htmlFor: "tags", className: "block text-sm font-medium text-gray-700 mb-2", children: "Product Tags" }), _jsxs("div", { className: "flex rounded-md shadow-sm", children: [_jsx("input", { type: "text", name: "tags", id: "tags", className: "focus:ring-sky-500 focus:border-sky-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300", placeholder: "Enter a tag", value: tagInput, onChange: (e) => setTagInput(e.target.value), onKeyPress: (e) => {
                                                                            if (e.key === "Enter") {
                                                                                e.preventDefault();
                                                                                handleAddTag();
                                                                            }
                                                                        } }), _jsx("button", { type: "button", onClick: handleAddTag, className: "inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100", children: "Add" })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Tags help with search and categorization" }), formData.tags && formData.tags.length > 0 ? (_jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: formData.tags.map((tag, index) => (_jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-sky-100 text-sky-800", children: [tag, _jsxs("button", { type: "button", onClick: () => handleRemoveTag(tag), className: "ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-sky-400 hover:bg-sky-200 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500", children: [_jsxs("span", { className: "sr-only", children: ["Remove tag ", tag] }), _jsx("svg", { className: "h-2 w-2", stroke: "currentColor", fill: "none", viewBox: "0 0 8 8", children: _jsx("path", { strokeLinecap: "round", strokeWidth: "1.5", d: "M1 1l6 6m0-6L1 7" }) })] })] }, index))) })) : (_jsx("p", { className: "mt-3 text-sm text-gray-500", children: "No tags added yet" }))] })] })), activeTab === "advanced" && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-yellow-400", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm text-yellow-700", children: "This section contains advanced settings. Only modify these if you know what you're doing." }) })] }) }), _jsxs("div", { className: "pt-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Custom Metadata" }), _jsx("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-4 text-center", children: _jsx("p", { className: "text-sm text-gray-500", children: "Custom metadata fields are not available in this version." }) })] }), _jsxs("div", { className: "pt-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "SEO Settings" }), _jsx("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-4 text-center", children: _jsx("p", { className: "text-sm text-gray-500", children: "SEO settings will be available in a future update." }) })] })] }))] })] }), _jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "submit", disabled: isLoading, className: `w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:ml-3 sm:w-auto sm:text-sm ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`, children: isLoading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Saving..."] })) : mode === "create" ? ("Create Product") : ("Save Changes") }), _jsx("button", { type: "button", onClick: onClose, className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm", children: "Cancel" })] })] }) })] }) }));
};
export default ProductModal;
