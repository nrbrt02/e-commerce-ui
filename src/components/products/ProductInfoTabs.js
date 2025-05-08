import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/products/ProductInfoTabs.tsx
import { useState } from "react";
import ProductReviews from "./ProductReviews";
import ProductSpecifications from "./ProductSpecifications";
const ProductInfoTabs = ({ product, activeTab = "description", }) => {
    const [currentTab, setCurrentTab] = useState(activeTab);
    // Extract any additional attributes from product.metadata if it exists
    const extractAttributes = () => {
        if (!product.metadata)
            return [];
        try {
            const metadata = typeof product.metadata === "string"
                ? JSON.parse(product.metadata)
                : product.metadata;
            return Object.entries(metadata)
                .filter(([value]) => typeof value !== "object")
                .map(([key, value]) => ({
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: value?.toString() || "",
            }));
        }
        catch (error) {
            console.error("Error parsing product metadata", error);
            return [];
        }
    };
    // Extract any specifications from product.metadata
    const extractSpecifications = () => {
        if (!product.metadata)
            return {};
        try {
            const metadata = typeof product.metadata === "string"
                ? JSON.parse(product.metadata)
                : product.metadata;
            // Filter out specifications from metadata
            return Object.entries(metadata)
                .filter(([specKey]) => specKey.toLowerCase().includes("spec") || specKey.toLowerCase().includes("technical"))
                .reduce((acc, [specKey, value]) => {
                acc[specKey] = value;
                return acc;
            }, {});
        }
        catch (error) {
            console.error("Error parsing product specifications", error);
            return {};
        }
    };
    return (_jsxs("div", { className: "mt-10 border-t border-gray-200 pt-6", children: [_jsx("div", { className: "border-b border-gray-200 mb-6", children: _jsxs("ul", { className: "flex flex-wrap -mb-px", children: [_jsx("li", { className: "mr-2", children: _jsx("button", { onClick: () => setCurrentTab("description"), className: `inline-block py-2 px-4 border-b-2 font-medium ${currentTab === "description"
                                    ? "text-sky-600 border-sky-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"}`, children: "Description" }) }), _jsx("li", { className: "mr-2", children: _jsx("button", { onClick: () => setCurrentTab("specifications"), className: `inline-block py-2 px-4 border-b-2 font-medium ${currentTab === "specifications"
                                    ? "text-sky-600 border-sky-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"}`, children: "Specifications" }) }), _jsx("li", { className: "mr-2", children: _jsx("button", { onClick: () => setCurrentTab("reviews"), className: `inline-block py-2 px-4 border-b-2 font-medium ${currentTab === "reviews"
                                    ? "text-sky-600 border-sky-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"}`, children: "Reviews" }) })] }) }), _jsxs("div", { children: [currentTab === "description" && (_jsxs("div", { className: "prose prose-sky max-w-none", children: [_jsx("p", { children: product.description }), product.shortDescription && (_jsx("p", { className: "mt-4", children: product.shortDescription })), product.descriptionHtml && (_jsx("div", { className: "mt-6", dangerouslySetInnerHTML: { __html: product.descriptionHtml } }))] })), currentTab === "specifications" && (_jsx(ProductSpecifications, { specifications: extractSpecifications(), dimensions: product.dimensions, weight: product.weight, isDigital: product.isDigital, attributes: extractAttributes(), sku: product.sku, brand: product.brand?.name })), currentTab === "reviews" && (_jsx(ProductReviews, { productId: product.id, initialRating: product.rating || 0, reviewCount: product.reviewCount || 0 }))] })] }));
};
export default ProductInfoTabs;
