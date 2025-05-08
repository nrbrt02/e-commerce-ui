import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const CategoryFilter = ({ categories, currentCategory, onCategoryChange }) => {
    return (_jsxs("div", { className: "space-y-1", children: [_jsx("button", { onClick: () => onCategoryChange(null), className: `block w-full text-left px-3 py-2 rounded-md text-sm ${!currentCategory
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'}`, children: "All Categories" }), categories.map(category => (_jsx("button", { onClick: () => onCategoryChange(category.slug), className: `block w-full text-left px-3 py-2 rounded-md text-sm ${currentCategory === category.slug
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'}`, children: category.name }, category.id)))] }));
};
export default CategoryFilter;
