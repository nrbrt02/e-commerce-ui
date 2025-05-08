import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/home/HomePage.tsx
import { useMemo } from 'react';
import HeroBanner from './HeroBanner';
import ProductGrid from './ProductGrid';
// import CategoryGrid from './CategoryGrid';
// import BrandCarousel from './BrandCarousel';
import useProducts from '../../hooks/useProducts';
const HomePage = () => {
    // Use our simplified hook to fetch all products
    const { products, isLoading, error } = useProducts();
    // Use memo to derive featured products from all products
    const featuredProducts = useMemo(() => {
        return products.filter(product => product.isFeatured);
    }, [products]);
    return (_jsxs("div", { className: "container mx-auto px-4", children: [_jsx("div", { className: "my-6", children: _jsx(HeroBanner, {}) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "my-8", children: error ? (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8", children: [_jsx("p", { className: "font-medium", children: "Error loading products:" }), _jsx("p", { children: error })] })) : (_jsx(ProductGrid, { title: "All", highlightedText: "Products", products: products, isLoading: isLoading })) }), featuredProducts.length > 0 && (_jsx("div", { className: "my-8", children: _jsx(ProductGrid, { title: "Featured", highlightedText: "Products", products: featuredProducts, isLoading: isLoading }) }))] })] }));
};
export default HomePage;
