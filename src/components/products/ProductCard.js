import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/ToastProvider';
import wishlistApi from '../../utils/wishlistApi';
const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { user, openAuthModal } = useAuth();
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
    // Initialize wishlist status on component mount and when product changes
    useEffect(() => {
        if (product) {
            setIsAddedToWishlist(isInWishlist(product.id.toString()));
        }
    }, [product, isInWishlist]);
    // Get the first valid image URL
    const getFirstImageUrl = (imageUrls) => {
        if (!imageUrls || imageUrls.length === 0) {
            return "/api/placeholder/150/200"; // Fallback image
        }
        try {
            const firstImageUrl = imageUrls[0];
            // If it's already a string URL, use it directly
            if (typeof firstImageUrl === 'string') {
                // Check if it's a JSON string that needs parsing
                if (firstImageUrl.startsWith('{') && firstImageUrl.includes('url')) {
                    try {
                        const parsed = JSON.parse(firstImageUrl);
                        if (parsed && parsed.url) {
                            return parsed.url;
                        }
                    }
                    catch (error) {
                        console.error("Error parsing image URL JSON:", error);
                    }
                }
                // If it's a direct URL or parsing failed, just return the string
                return firstImageUrl.startsWith('http') ?
                    firstImageUrl :
                    "/api/placeholder/150/200";
            }
            // Fallback to placeholder if the URL isn't a string
            return "/api/placeholder/150/200";
        }
        catch (error) {
            console.error("Error processing image URL:", error);
            return "/api/placeholder/150/200";
        }
    };
    // Calculate discount percentage
    const calculateDiscount = (price, compareAtPrice) => {
        if (!compareAtPrice)
            return 0;
        const currentPrice = parseFloat(price);
        const originalPrice = parseFloat(compareAtPrice);
        if (originalPrice <= currentPrice)
            return 0;
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    };
    // Calculate savings amount
    const calculateSavings = (price, compareAtPrice) => {
        if (!compareAtPrice)
            return 0;
        const currentPrice = parseFloat(price);
        const originalPrice = parseFloat(compareAtPrice);
        if (originalPrice <= currentPrice)
            return 0;
        return originalPrice - currentPrice;
    };
    // Handle add to cart
    const handleAddToCart = (navigateToCart = false) => {
        const currentPrice = parseFloat(product.price);
        const originalPrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
        addToCart({
            id: product.id,
            name: product.name,
            image: getFirstImageUrl(product.imageUrls),
            price: currentPrice,
            originalPrice: originalPrice || undefined,
            quantity: 1,
            stock: product.quantity
        }, navigateToCart);
        // Only show visual feedback if we're not navigating to cart
        if (!navigateToCart) {
            // Show added to cart visual feedback
            setIsAddedToCart(true);
            // Remove visual feedback after 2 seconds
            setTimeout(() => {
                setIsAddedToCart(false);
            }, 2000);
            // Show success toast
            showToast.success(`${product.name} added to cart`);
        }
    };
    // Handle add to wishlist - improved version based on ProductDetail.tsx implementation
    const handleToggleWishlist = async () => {
        if (!product)
            return;
        // If user is not logged in, open auth modal
        if (!user) {
            openAuthModal("login");
            return;
        }
        setWishlistLoading(true);
        // Debug auth status
        const token = localStorage.getItem("fast_shopping_token");
        console.log("Auth status before wishlist action:", {
            token: token ? "Present" : "Missing",
            tokenLength: token?.length || 0,
            isAuthenticated: !!user,
            userExists: !!user,
            userId: user?.id,
        });
        try {
            if (isAddedToWishlist) {
                // Remove from wishlist
                const success = await removeFromWishlist(product.id.toString());
                if (success) {
                    setIsAddedToWishlist(false);
                    showToast.info(`${product.name} removed from wishlist`);
                }
                else {
                    throw new Error("Failed to remove from wishlist");
                }
            }
            else {
                // Add to wishlist
                // First get or create default wishlist
                let wishlistId;
                try {
                    // Try to get wishlists
                    const wishlists = await wishlistApi.getWishlists();
                    if (wishlists &&
                        wishlists.data &&
                        wishlists.data.wishlists &&
                        wishlists.data.wishlists.length > 0) {
                        // Use the first wishlist
                        wishlistId = wishlists.data.wishlists[0].id;
                    }
                    else {
                        // Create a new wishlist if none exists
                        const newWishlist = await wishlistApi.createWishlist({
                            name: "My Wishlist",
                            isPublic: false,
                        });
                        wishlistId = newWishlist.data.wishlist.id;
                    }
                }
                catch (error) {
                    console.error("Error getting/creating wishlist:", error);
                    // Fallback to default wishlist
                    wishlistId = "default";
                }
                // Now add the product to the wishlist
                await wishlistApi.addProductToWishlist(wishlistId, {
                    productId: product.id,
                });
                // Add to local state
                const imageUrl = getFirstImageUrl(product.imageUrls);
                addToWishlist({
                    id: product.id.toString(),
                    name: product.name,
                    slug: product.id.toString(), // Using ID as slug if not available
                    price: parseFloat(product.price),
                    image: imageUrl,
                    inStock: product.quantity > 0,
                    category: product.categories && product.categories.length > 0 ? product.categories[0].name : undefined,
                    discount: calculateDiscount(product.price, product.compareAtPrice)
                });
                setIsAddedToWishlist(true);
                showToast.success(`${product.name} added to wishlist`);
                // Show a wishlist message in the UI if needed
                // This part is optional and can be customized based on your UI requirements
            }
        }
        catch (error) {
            console.error("Error updating wishlist:", error);
            showToast.error(`Failed to update wishlist: ${error instanceof Error ? error.message : "Unknown error"}`);
            // Show error message to user
            // You could implement a toast or some other feedback mechanism here
        }
        finally {
            setWishlistLoading(false);
        }
    };
    const imageUrl = getFirstImageUrl(product.imageUrls);
    const discount = calculateDiscount(product.price, product.compareAtPrice);
    const savings = calculateSavings(product.price, product.compareAtPrice);
    const isLowStock = product.quantity <= product.lowStockThreshold && product.lowStockThreshold > 0;
    const isSoldOut = product.quantity === 0;
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group", children: [_jsx(Link, { to: `/product/${product.id}`, className: "block relative", children: _jsxs("div", { className: "relative h-48 overflow-hidden bg-gray-50", children: [_jsx("img", { src: imageUrl, alt: product.name, className: "w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-300" }), discount > 0 && (_jsxs("div", { className: "absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded", children: [discount, "% OFF"] })), isSoldOut && (_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-lg", children: "SOLD OUT" }) })), product.isFeatured && !isSoldOut && (_jsx("div", { className: "absolute top-2 right-2 bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded", children: "Featured" }))] }) }), _jsxs("div", { className: "p-4", children: [_jsx(Link, { to: `/product/${product.id}`, className: "block", children: _jsx("h3", { className: "text-sm text-gray-800 font-medium line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors", children: product.name }) }), _jsxs("div", { className: "flex items-center mb-1", children: [_jsxs("span", { className: "text-lg font-bold text-gray-800", children: ["Rwf", parseFloat(product.price).toLocaleString()] }), product.compareAtPrice && (_jsxs("span", { className: "text-sm text-gray-500 line-through ml-2", children: ["Rwf", parseFloat(product.compareAtPrice).toLocaleString()] }))] }), savings > 0 && (_jsxs("p", { className: "text-xs text-green-600 font-medium", children: ["You save: Rwf", savings.toLocaleString()] })), isLowStock && !isSoldOut && (_jsxs("p", { className: "text-xs text-orange-500 mt-1", children: [_jsx("i", { className: "fas fa-exclamation-circle mr-1" }), "Only ", product.quantity, " left"] }))] }), _jsxs("div", { className: "px-4 pb-4 flex space-x-2", children: [_jsx("button", { onClick: () => handleAddToCart(), disabled: isSoldOut, className: `flex-1 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center ${isAddedToCart
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : isSoldOut
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'}`, children: isAddedToCart ? (_jsxs(_Fragment, { children: [_jsx("i", { className: "fas fa-check mr-1" }), " Added"] })) : isSoldOut ? ('Sold Out') : ('Add to Cart') }), !isSoldOut && (_jsx("button", { onClick: () => handleAddToCart(true), className: "p-2 bg-sky-700 hover:bg-sky-800 text-white rounded transition-colors duration-200 flex-shrink-0", title: "Buy Now", children: _jsx("i", { className: "fas fa-bolt" }) })), _jsx("button", { onClick: handleToggleWishlist, disabled: wishlistLoading, className: `p-2 border rounded transition-colors duration-200 flex-shrink-0 ${isAddedToWishlist
                            ? "border-red-200 bg-red-50 hover:bg-red-100 text-red-500"
                            : "border-gray-300 hover:border-sky-600 text-gray-600 hover:text-sky-600"} ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`, title: isAddedToWishlist ? "Remove from Wishlist" : "Add to Wishlist", children: wishlistLoading ? (_jsx("i", { className: "fas fa-spinner fa-spin" })) : (_jsx("i", { className: `${isAddedToWishlist ? "fas" : "far"} fa-heart` })) })] })] }));
};
export default ProductCard;
