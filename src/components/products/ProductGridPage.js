import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import ProductGrid from '../home/ProductGrid';
const ProductGridPage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch('/api/products');
                const data = await response.json();
                setProducts(data.products || []);
            }
            catch (error) {
                console.error('Error fetching products:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);
    return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx(ProductGrid, { title: "All Products", highlightedText: "Collection", products: products, isLoading: isLoading }) }));
};
export default ProductGridPage;
