// src/components/home/ProductGrid.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../components/ui/ToastProvider";
import wishlistApi from "../../utils/wishlistApi";

// Define types based on your API response
interface ProductImage {
  url: string;
}

interface ProductDimensions {
  width: number;
  height: number;
  length: number;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string;
  isPublished: boolean;
  isFeatured: boolean;
  quantity: number;
  lowStockThreshold: number;
  weight: number;
  dimensions: ProductDimensions;
  imageUrls: string[];
  tags: string[];
  categories: ProductCategory[];
}

interface ProductGridProps {
  title: string;
  highlightedText: string;
  products: ApiProduct[];
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  highlightedText,
  products,
  isLoading = false,
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const [addedToCartIds, setAddedToCartIds] = useState<number[]>([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<number[]>([]);

  // Parse image URLs
  const getFirstImageUrl = (imageUrlsJson: string[]): string => {
    if (!imageUrlsJson || imageUrlsJson.length === 0) {
      return "/api/placeholder/150/200"; // Fallback image
    }

    try {
      const firstImageUrl = imageUrlsJson[0];

      // If it's already a string URL, use it directly
      if (typeof firstImageUrl === "string") {
        // Check if it's a JSON string that needs parsing
        if (firstImageUrl.startsWith("{") && firstImageUrl.includes("url")) {
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
        return firstImageUrl.startsWith("http")
          ? firstImageUrl
          : "/api/placeholder/150/200";
      }

      // Fallback to placeholder if the URL isn't a string
      return "/api/placeholder/150/200";
    } catch (error) {
      console.error("Error processing image URL:", error);
      return "/api/placeholder/150/200";
    }
  };

  // Calculate discount percentage
  const calculateDiscount = (
    price: string,
    compareAtPrice: string | null
  ): number => {
    if (!compareAtPrice) return 0;

    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(compareAtPrice);

    if (originalPrice <= currentPrice) return 0;

    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  // Calculate savings amount
  const calculateSavings = (
    price: string,
    compareAtPrice: string | null
  ): number => {
    if (!compareAtPrice) return 0;

    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(compareAtPrice);

    if (originalPrice <= currentPrice) return 0;

    return originalPrice - currentPrice;
  };

  // Handle add to cart
  const handleAddToCart = (
    product: ApiProduct,
    navigateToCart: boolean = false
  ) => {
    const currentPrice = parseFloat(product.price);
    const originalPrice = product.compareAtPrice
      ? parseFloat(product.compareAtPrice)
      : null;

    addToCart(
      {
        id: product.id,
        name: product.name,
        image: getFirstImageUrl(product.imageUrls),
        price: currentPrice,
        originalPrice: originalPrice || undefined,
        quantity: 1,
        stock: product.quantity,
      },
      navigateToCart
    );

    // Only show visual feedback if we're not navigating to cart
    if (!navigateToCart) {
      // Show added to cart visual feedback
      setAddedToCartIds((prev) => [...prev, product.id]);

      // Remove visual feedback after 2 seconds
      setTimeout(() => {
        setAddedToCartIds((prev) => prev.filter((id) => id !== product.id));
      }, 2000);

      // Show success toast
      showToast.success(`${product.name} added to cart`);
    }
  };

  // Handle toggle wishlist
  const handleToggleWishlist = async (product: ApiProduct) => {
    if (!product) return;

    // If user is not logged in, open auth modal
    if (!user) {
      openAuthModal("login");
      return;
    }

    // Set loading state
    setWishlistLoadingIds((prev) => [...prev, product.id]);

    // Debug auth status
    const token = localStorage.getItem("fast_shopping_token");
    console.log("Auth status before wishlist action:", {
      token: token ? "Present" : "Missing",
      tokenLength: token?.length || 0,
      isAuthenticated: !!user,
      userExists: !!user,
      userId: user?.id,
    });

    const productInWishlist = isInWishlist(product.id.toString());

    try {
      if (productInWishlist) {
        // Remove from wishlist
        const success = await removeFromWishlist(product.id.toString());
        if (success) {
          showToast.info(`${product.name} removed from wishlist`);
        } else {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        // First get or create default wishlist
        let wishlistId;

        try {
          // Try to get wishlists
          const wishlists = await wishlistApi.getWishlists();
          if (
            wishlists &&
            wishlists.data &&
            wishlists.data.wishlists &&
            wishlists.data.wishlists.length > 0
          ) {
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

        addToWishlist({
          id: product.id.toString(),
          name: product.name,
          slug: product.id.toString(), // Using ID as slug if not available
          price: parseFloat(product.price),
          image: imageUrl,
          inStock: product.quantity > 0,
          category:
            product.categories && product.categories.length > 0
              ? product.categories[0].name
              : undefined,
          discount: calculateDiscount(product.price, product.compareAtPrice),
        });

        showToast.success(`${product.name} added to wishlist`);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      showToast.error(
        `Failed to update wishlist: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      // Remove loading state
      setWishlistLoadingIds((prev) => prev.filter((id) => id !== product.id));
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        {/* Section Title Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
              <div className="px-4 pb-4 flex space-x-2">
                <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getViewAllLink = () => {
    if (title.toLowerCase() === "featured") {
      return "/products?featured=true";
    }
    return "/products";
  };
  return (
    <div>
      {/* Section Title */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {title} <span className="text-sky-600">{highlightedText}</span>
        </h2>
        <Link
          to={getViewAllLink()}
          className="text-sky-600 hover:text-sky-700 font-medium flex items-center group"
        >
          View All
          <svg
            className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.length === 0 ? (
          <div className="col-span-5 py-16 text-center">
            <div className="text-gray-400 text-5xl mb-4">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">Check back later for new products</p>
          </div>
        ) : (
          products.map((product) => {
            const imageUrl = getFirstImageUrl(product.imageUrls);
            const discount = calculateDiscount(
              product.price,
              product.compareAtPrice
            );
            const savings = calculateSavings(
              product.price,
              product.compareAtPrice
            );
            const isAddedToCart = addedToCartIds.includes(product.id);
            const isWishlistLoading = wishlistLoadingIds.includes(product.id);
            const isInWishlistAlready = isInWishlist(product.id.toString());
            const isLowStock =
              product.quantity <= product.lowStockThreshold &&
              product.lowStockThreshold > 0;
            const isSoldOut = product.quantity === 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
              >
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
                        <span className="text-white font-bold text-lg">
                          SOLD OUT
                        </span>
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
                      Rwf{parseFloat(product.price).toLocaleString()}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        Rwf{parseFloat(product.compareAtPrice).toLocaleString()}
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
                    onClick={() => handleAddToCart(product)}
                    disabled={isSoldOut}
                    className={`flex-1 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                      isAddedToCart
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : isSoldOut
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-sky-600 hover:bg-sky-700 text-white"
                    }`}
                  >
                    {isAddedToCart ? (
                      <>
                        <i className="fas fa-check mr-1"></i> Added
                      </>
                    ) : isSoldOut ? (
                      "Sold Out"
                    ) : (
                      "Add to Cart"
                    )}
                  </button>

                  {/* Buy Now button - adds to cart and navigates to cart page */}
                  {!isSoldOut && (
                    <button
                      onClick={() => handleAddToCart(product, true)}
                      className="p-2 bg-sky-700 hover:bg-sky-800 text-white rounded transition-colors duration-200 flex-shrink-0"
                      title="Buy Now"
                    >
                      <i className="fas fa-bolt"></i>
                    </button>
                  )}

                  {/* Wishlist button - improved version consistent with other components */}
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    disabled={isWishlistLoading}
                    className={`p-2 border rounded transition-colors duration-200 flex-shrink-0 ${
                      isInWishlistAlready
                        ? "border-red-200 bg-red-50 hover:bg-red-100 text-red-500"
                        : "border-gray-300 hover:border-sky-600 text-gray-600 hover:text-sky-600"
                    } ${
                      isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={
                      isInWishlistAlready
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"
                    }
                  >
                    {isWishlistLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i
                        className={`${
                          isInWishlistAlready ? "fas" : "far"
                        } fa-heart`}
                      ></i>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
