import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
const ProductDetailsModal = ({ isOpen, onClose, product, }) => {
    if (!isOpen || !product)
        return null;
    const formatPrice = (price) => {
        if (price === null || price === undefined)
            return "Not set";
        const priceValue = typeof price === "string" ? parseFloat(price) : price;
        return priceValue.toLocaleString("en-US", {
            style: "currency",
            currency: "RWF",
        });
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const getStatus = () => {
        if (product.quantity <= 0)
            return "Out of Stock";
        if (product.lowStockThreshold &&
            product.quantity <= product.lowStockThreshold)
            return "Low Stock";
        return "In Stock";
    };
    const getStatusBadgeClass = () => {
        const status = getStatus();
        switch (status) {
            case "In Stock":
                return "bg-green-100 text-green-800";
            case "Low Stock":
                return "bg-yellow-100 text-yellow-800";
            case "Out of Stock":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    // Function to safely parse image URLs
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
    // Log image URLs for debugging
    useEffect(() => {
        if (product && product.imageUrls && product.imageUrls.length > 0) {
            console.log("Product images:", product.imageUrls);
            console.log("Parsed first image:", parseImageUrl(product.imageUrls[0]));
        }
    }, [product]);
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", "aria-labelledby": "product-details-modal", role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 transition-opacity", "aria-hidden": "true", children: _jsx("div", { className: "absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: onClose }) }), _jsx("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true", children: "\u200B" }), _jsxs("div", { className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-headline", children: [_jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: _jsx("div", { className: "sm:flex sm:items-start", children: _jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:text-left w-full", children: [_jsxs("div", { className: "flex justify-between items-start border-b border-gray-200 pb-4 mb-5", children: [_jsx("h3", { className: "text-xl leading-6 font-medium text-gray-900", id: "modal-headline", children: product.name }), _jsxs("button", { onClick: onClose, className: "bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500", "aria-label": "Close", children: [_jsx("span", { className: "sr-only", children: "Close" }), _jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "col-span-1", children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 mb-2", children: "Product Images" }), product.imageUrls && product.imageUrls.length > 0 ? (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "aspect-square overflow-hidden rounded-lg bg-gray-100 mb-2", children: _jsx("img", { src: parseImageUrl(product.imageUrls[0]), alt: product.name, className: "h-full w-full object-cover", onError: (e) => {
                                                                            e.target.src =
                                                                                "https://via.placeholder.com/300?text=No+Image";
                                                                        } }) }), product.imageUrls.length > 1 && (_jsx("div", { className: "grid grid-cols-4 gap-2", children: product.imageUrls.map((img, index) => (_jsx("div", { className: "aspect-square overflow-hidden rounded-md bg-gray-100", children: _jsx("img", { src: parseImageUrl(img), alt: `Product ${index + 1}`, className: "h-full w-full object-cover", onError: (e) => {
                                                                                e.target.src =
                                                                                    "https://via.placeholder.com/150?text=Error";
                                                                            } }) }, index))) }))] })) : (_jsxs("div", { className: "aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-16 w-16", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No images available" })] })), _jsxs("div", { className: "mt-6 bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700", children: "Product Status" }), _jsx("span", { className: `px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass()}`, children: getStatus() })] }), _jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2 text-sm", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-500", children: "Published" }), _jsx("span", { className: "font-medium", children: product.isPublished ? "Yes" : "No" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-500", children: "Featured" }), _jsx("span", { className: "font-medium", children: product.isFeatured ? "Yes" : "No" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-500", children: "Digital Product" }), _jsx("span", { className: "font-medium", children: product.isDigital ? "Yes" : "No" })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-gray-500", children: "Last Updated" }), _jsx("span", { className: "font-medium", children: product.updatedAt
                                                                                        ? formatDate(product.updatedAt).split(",")[0]
                                                                                        : "N/A" })] })] })] })] }), _jsx("div", { className: "col-span-1 md:col-span-2", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 mb-2", children: "Basic Information" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [product.shortDescription && (_jsxs("div", { className: "mb-4", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Short Description" }), _jsx("p", { className: "text-sm text-gray-900", children: product.shortDescription })] })), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Full Description" }), _jsx("p", { className: "text-sm text-gray-900 whitespace-pre-line", children: product.description || "No description provided" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 mb-2", children: "Product Identifiers" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "SKU" }), _jsx("p", { className: "text-sm text-gray-900 font-mono", children: product.sku })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Barcode" }), _jsx("p", { className: "text-sm text-gray-900 font-mono", children: product.barcode || "N/A" })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Categories" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: product.categories &&
                                                                                            product.categories.length > 0 ? (product.categories.map((category) => (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: category.name }, category.id)))) : (_jsx("span", { className: "text-sm text-gray-500", children: "No categories assigned" })) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: product.tags && product.tags.length > 0 ? (product.tags.map((tag, index) => (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: tag }, index)))) : (_jsx("span", { className: "text-sm text-gray-500", children: "No tags" })) })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 mb-2", children: "Pricing & Inventory" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Price" }), _jsxs("p", { className: "text-sm text-gray-900 font-medium", children: [product.price !== undefined
                                                                                                ? formatPrice(product.price)
                                                                                                : "Not set", product.compareAtPrice && (_jsx("span", { className: "ml-2 text-sm text-gray-500 line-through", children: formatPrice(product.compareAtPrice) }))] })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Cost Price" }), _jsx("p", { className: "text-sm text-gray-900", children: formatPrice(product.costPrice) || "Not set" })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Stock Quantity" }), _jsx("p", { className: "text-sm text-gray-900", children: product.quantity })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Low Stock Threshold" }), _jsx("p", { className: "text-sm text-gray-900", children: product.lowStockThreshold || "Not set" })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Weight" }), _jsx("p", { className: "text-sm text-gray-900", children: product.weight ? `${product.weight} g` : "N/A" })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Dimensions (L \u00D7 W \u00D7 H)" }), _jsx("p", { className: "text-sm text-gray-900", children: product.dimensions
                                                                                            ? `${product.dimensions.length || 0} × ${product.dimensions.width || 0} × ${product.dimensions.height || 0} cm`
                                                                                            : "N/A" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 mb-2", children: "Supplier Information" }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Supplier" }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mr-2", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", clipRule: "evenodd" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: product.supplier?.username || "N/A" }), _jsx("p", { className: "text-xs text-gray-500", children: product.supplier?.email || "" })] })] })] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-500 mb-2", children: "Timestamps" }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Created At" }), _jsx("p", { className: "text-sm text-gray-900", children: formatDate(product.createdAt) })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-1", children: "Updated At" }), _jsx("p", { className: "text-sm text-gray-900", children: formatDate(product.updatedAt) })] })] })] })] }) })] })] }) }) }), _jsx("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: _jsx("button", { type: "button", className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:ml-3 sm:w-auto sm:text-sm", onClick: onClose, children: "Close" }) })] })] }) }));
};
export default ProductDetailsModal;
