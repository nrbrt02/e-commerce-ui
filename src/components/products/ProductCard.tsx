import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/ToastProvider';
import wishlistApi from '../../utils/wishlistApi';

interface ProductImage {
  url: string;
}

// Create a type that combines the most permissive version of both Product and ApiProduct
type ProductCardProduct = {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode?: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  costPrice?: string | number | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital?: boolean;
  quantity: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    length: number;
  };
  metadata?: any;
  tags?: string[];
  imageUrls?: string[];
  supplierId?: number;
  createdAt?: string;
  updatedAt?: string;
  supplier?: {
    id: number;
    username: string;
    email: string;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
};

interface ProductCardProps {
  product: ProductCardProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
  
  // Initialize wishlist status on component mount and when product changes
  useEffect(() => {
    if (product && product.id) {
      setIsAddedToWishlist(isInWishlist(product.id.toString()));
    }
  }, [product, isInWishlist]);
  
  // Get the first valid image URL
  const getFirstImageUrl = (imageUrls?: string[]): string => {
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
            const parsed = JSON.parse(firstImageUrl) as ProductImage;
            if (parsed && parsed.url) {
              return parsed.url;
            }
          } catch (error) {
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
    } catch (error) {
      console.error("Error processing image URL:", error);
      return "/api/placeholder/150/200";
    }
  };

  // Calculate discount percentage
  const calculateDiscount = (price: string | number, compareAtPrice?: string | number | null): number => {
    if (!compareAtPrice) return 0;
    
    const currentPrice = typeof price === 'string' ? parseFloat(price) : price;
    const originalPrice = typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : compareAtPrice;
    
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Calculate savings amount
  const calculateSavings = (price: string | number, compareAtPrice?: string | number | null): number => {
    if (!compareAtPrice) return 0;
    
    const currentPrice = typeof price === 'string' ? parseFloat(price) : price;
    const originalPrice = typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : compareAtPrice;
    
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    
    return originalPrice - currentPrice;
  };

  // Handle add to cart
  const handleAddToCart = (navigateToCart: boolean = false) => {
    if (!product.id) return;
    
    const currentPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const originalPrice = product.compareAtPrice ? 
      (typeof product.compareAtPrice === 'string' ? parseFloat(product.compareAtPrice) : product.compareAtPrice) : 
      null;
    
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

  // Handle add to wishlist
  const handleToggleWishlist = async () => {
    if (!product || !product.id) return;
    
    // If user is not logged in, open auth modal
    if (!user) {
      openAuthModal("login");
      return;
    }
    
    setWishlistLoading(true);
    
    try {
      if (isAddedToWishlist) {
        // Remove from wishlist
        const success = await removeFromWishlist(product.id.toString());
        if (success) {
          setIsAddedToWishlist(false);
          showToast.info(`${product.name} removed from wishlist`);
        } else {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        let wishlistId;
        
        try {
          // Try to get wishlists
          const wishlists = await wishlistApi.getWishlists();
          if (wishlists?.data?.wishlists?.length > 0) {
            // Use the first wishlist
            wishlistId = wishlists.data.wishlists[0].id;
          } else {
            // Create a new wishlist if none exists
            const newWishlist = await wishlistApi.createWishlist({
              name: "My Wishlist",
              isPublic: false,
            });
            wishlistId = newWishlist.data.wishlist.id;
          }
        } catch (error) {
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
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        
        addToWishlist({
          id: product.id.toString(),
          name: product.name,
          slug: product.id.toString(),
          price: price,
          image: imageUrl,
          inStock: (product.quantity || 0) > 0,
          category: product.categories?.[0]?.name,
          discount: calculateDiscount(product.price, product.compareAtPrice)
        });
        
        setIsAddedToWishlist(true);
        showToast.success(`${product.name} added to wishlist`);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showToast.error(`Failed to update wishlist: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setWishlistLoading(false);
    }
  };
  
  const imageUrl = getFirstImageUrl(product.imageUrls);
  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const savings = calculateSavings(product.price, product.compareAtPrice);
  const isLowStock = (product.quantity || 0) <= (product.lowStockThreshold || 0) && (product.lowStockThreshold || 0) > 0;
  const isSoldOut = (product.quantity || 0) === 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="relative h-48 overflow-hidden bg-gray-50">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain p-4 transform group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SOLD OUT</span>
            </div>
          )}
          {product.isFeatured && !isSoldOut && (
            <div className="absolute top-2 right-2 bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm text-gray-800 font-medium line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-1">
          <span className="text-lg font-bold text-gray-800">
            Rwf{typeof product.price === 'string' ? parseFloat(product.price).toLocaleString() : product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              Rwf{typeof product.compareAtPrice === 'string' ? 
                parseFloat(product.compareAtPrice).toLocaleString() : 
                product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {savings > 0 && (
          <p className="text-xs text-green-600 font-medium">
            You save: Rwf{savings.toLocaleString()}
          </p>
        )}

        {isLowStock && !isSoldOut && (
          <p className="text-xs text-orange-500 mt-1">
            <i className="fas fa-exclamation-circle mr-1"></i>
            Only {product.quantity} left
          </p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 pb-4 flex space-x-2">
        <button 
          onClick={() => handleAddToCart()}
          disabled={isSoldOut}
          className={`flex-1 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center ${
            isAddedToCart
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : isSoldOut
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          {isAddedToCart ? (
            <>
              <i className="fas fa-check mr-1"></i> Added
            </>
          ) : isSoldOut ? (
            'Sold Out'
          ) : (
            'Add to Cart'
          )}
        </button>
        
        {/* Buy Now button - adds to cart and navigates to cart page */}
        {!isSoldOut && (
          <button 
            onClick={() => handleAddToCart(true)} 
            className="p-2 bg-sky-700 hover:bg-sky-800 text-white rounded transition-colors duration-200 flex-shrink-0"
            title="Buy Now"
          >
            <i className="fas fa-bolt"></i>
          </button>
        )}
        
        {/* Wishlist button */}
        <button 
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className={`p-2 border rounded transition-colors duration-200 flex-shrink-0 ${
            isAddedToWishlist 
              ? "border-red-200 bg-red-50 hover:bg-red-100 text-red-500" 
              : "border-gray-300 hover:border-sky-600 text-gray-600 hover:text-sky-600"
          } ${
            wishlistLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title={isAddedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className={`${isAddedToWishlist ? "fas" : "far"} fa-heart`}></i>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;