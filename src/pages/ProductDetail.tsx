// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { ApiProduct } from "../hooks/useProducts";
import wishlistApi from "../utils/wishlistApi";
import ProductInfoTabs from "../components/products/ProductInfoTabs";

interface ProductImage {
  url: string;
}

const ProductDetail: React.FC = () => {
  // Only call useAuth() once and get all needed values
  const { user, openAuthModal } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
  const [parsedImages, setParsedImages] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = `${apiBaseUrl}/products/${id}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch product: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.status === "success" && data.data && data.data.product) {
          setProduct(data.data.product);
          const images = parseImageUrls(data.data.product.imageUrls);
          setParsedImages(images);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );

        try {
          const allProductsEndpoint = `${apiBaseUrl}/products`;
          const allProductsResponse = await fetch(allProductsEndpoint);

          if (!allProductsResponse.ok) {
            throw new Error(
              `Failed to fetch products: ${allProductsResponse.status} ${allProductsResponse.statusText}`
            );
          }

          const allProductsData = await allProductsResponse.json();

          if (
            allProductsData.status === "success" &&
            allProductsData.data &&
            allProductsData.data.products
          ) {
            const foundProduct = allProductsData.data.products.find(
              (p: ApiProduct) => p.id === parseInt(id || "0")
            );

            if (foundProduct) {
              setProduct(foundProduct);
              const images = parseImageUrls(foundProduct.imageUrls);
              setParsedImages(images);
              setError(null);
            } else {
              setError("Product not found");
            }
          } else {
            throw new Error("Invalid data format received from API");
          }
        } catch (fallbackErr) {
          console.error("Error in fallback product fetch:", fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, apiBaseUrl]);

  useEffect(() => {
    if (product && id) {
      setIsAddedToWishlist(isInWishlist(id));
    }
  }, [product, id, isInWishlist]);

  const parseImageUrls = (imageUrlsJson: string[]): string[] => {
    if (
      !imageUrlsJson ||
      !Array.isArray(imageUrlsJson) ||
      imageUrlsJson.length === 0
    ) {
      return ["/api/placeholder/400/400"];
    }

    try {
      return imageUrlsJson.map((imageJson) => {
        if (
          typeof imageJson === "string" &&
          imageJson.startsWith("{") &&
          imageJson.includes("url")
        ) {
          try {
            const parsed = JSON.parse(imageJson) as ProductImage;
            return parsed.url.startsWith("http")
              ? parsed.url
              : "/api/placeholder/400/400";
          } catch (error) {
            console.error("Error parsing image URL JSON:", error);
            return "/api/placeholder/400/400";
          }
        } else {
          return imageJson;
        }
      });
    } catch (error) {
      console.error("Error parsing image URLs:", error);
      return ["/api/placeholder/400/400"];
    }
  };

  const updateQuantity = (newQuantity: number) => {
    if (!product) return;
    const maxStock = product.quantity;
    setQuantity(Math.min(Math.max(1, newQuantity), maxStock));
  };

  const handleAddToCart = (navigateToCart = false) => {
    if (!product) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        image: parsedImages[0],
        price: parseFloat(product.price),
        originalPrice: product.compareAtPrice
          ? parseFloat(product.compareAtPrice)
          : undefined,
        quantity: quantity,
        stock: product.quantity,
      },
      navigateToCart
    );

    if (!navigateToCart) {
      setIsAddedToCart(true);
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 3000);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product || !id) {
      return;
    }

    // If user is not logged in, open auth modal
    if (!user) {
      openAuthModal("login"); // Use the function from the destructured hook
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
        const success = await removeFromWishlist(id);
        if (success) {
          setIsAddedToWishlist(false);
        } else {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        // Use your wishlistApi instead of direct fetch
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
          productId: parseInt(id),
        });

        // Add to local state
        addToWishlist({
          id: id,
          name: product.name,
          slug: id,
          price: parseFloat(product.price),
          image: parsedImages[0],
          inStock: product.quantity > 0,
          category:
            product.categories && product.categories.length > 0
              ? product.categories[0].name
              : undefined,
          discount: calculateDiscount(product.price, product.compareAtPrice),
        });

        setIsAddedToWishlist(true);

        // Show success message
        const wishlistMessage = document.getElementById("wishlist-message");
        if (wishlistMessage) {
          wishlistMessage.classList.remove("hidden");
          setTimeout(() => {
            wishlistMessage.classList.add("hidden");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);

      // Show error message to user
      const errorMessage = document.getElementById("error-message");
      if (errorMessage) {
        errorMessage.textContent =
          error instanceof Error ? error.message : "Failed to update wishlist";
        errorMessage.classList.remove("hidden");
        setTimeout(() => {
          errorMessage.classList.add("hidden");
        }, 5000);
      }
    } finally {
      setWishlistLoading(false);
    }
  };
  
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
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            <div className="lg:w-2/5">
              <div className="aspect-square rounded-lg bg-gray-200 mb-4"></div>
              <div className="flex gap-2 mt-2">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-gray-200 rounded"
                  ></div>
                ))}
              </div>
            </div>

            <div className="lg:w-3/5">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="flex gap-4 mb-6">
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded flex-grow"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded mb-6"></div>
            </div>
          </div>
        </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || "Product not found"}
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the product you're looking for.
            </p>
            <Link
              to="/"
              className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
    );
  }

  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const isLowStock =
    product.quantity <= product.lowStockThreshold &&
    product.lowStockThreshold > 0;
  const isSoldOut = product.quantity === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-sm text-gray-500">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="hover:text-sky-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {product.categories && product.categories.length > 0 ? (
                    <Link
                      to={`/products?category=${product.categories[0].slug}`}
                      className="hover:text-sky-600 transition-colors"
                    >
                      {product.categories[0].name}
                    </Link>
                  ) : (
                    <span>Products</span>
                  )}
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-gray-700 truncate max-w-xs">
                    {product.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/5">
            <div className="sticky top-24">
              <div className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 mb-4">
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                    <span className="text-white font-bold text-xl">
                      SOLD OUT
                    </span>
                  </div>
                )}
                <img
                  src={parsedImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {parsedImages.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {parsedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 border-2 rounded overflow-hidden ${
                        activeImage === index
                          ? "border-sky-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-3/5">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-500">SKU:</span>
                <span className="ml-1 text-gray-700">{product.sku}</span>
              </div>

              {product.supplier && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500">Sold by:</span>
                  <span className="ml-1 text-gray-700">
                    {product.supplier.username}
                  </span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <span
                  className={
                    product.quantity > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {isSoldOut ? "Out of Stock" : "In Stock"}
                </span>
                {isLowStock && !isSoldOut && (
                  <span className="ml-1 text-orange-500">
                    (Only {product.quantity} left)
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-800">
                  Rwf{parseFloat(product.price).toLocaleString()}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    Rwf{parseFloat(product.compareAtPrice).toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div className="flex items-center border border-gray-300 rounded-md h-12">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1 || isSoldOut}
                  className="w-12 h-full text-gray-600 hover:text-sky-600 border-r border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="w-12 h-full flex items-center justify-center text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  disabled={quantity >= product.quantity || isSoldOut}
                  className="w-12 h-full text-gray-600 hover:text-sky-600 border-l border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>

              <div className="flex-grow flex gap-2">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isSoldOut}
                  className={`flex-grow h-12 font-medium rounded-md flex items-center justify-center ${
                    isSoldOut
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-sky-600 text-white hover:bg-sky-700 transition-colors duration-200"
                  }`}
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Add to Cart
                </button>

                {user && (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`h-12 w-12 flex items-center justify-center rounded-md transition-colors duration-200 ${
                      isAddedToWishlist
                        ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                        : "border border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-500"
                    } ${
                      wishlistLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label={
                      isAddedToWishlist
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"
                    }
                  >
                    {wishlistLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i
                        className={`${
                          isAddedToWishlist ? "fas" : "far"
                        } fa-heart`}
                      ></i>
                    )}
                  </button>
                )}
              </div>
            </div>

            {isAddedToCart && (
              <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2 animate-fade-in">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Item added to your cart successfully!</span>
                <Link
                  to="/cart"
                  className="ml-auto text-sky-600 hover:text-sky-700 text-sm font-medium"
                >
                  View Cart
                </Link>
              </div>
            )}

            <div
              id="wishlist-message"
              className="mb-6 px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 flex items-center gap-2 animate-fade-in hidden"
            >
              <i className="fas fa-heart text-red-500"></i>
              <span>Item added to your wishlist!</span>
              <Link
                to="/account?tab=wishlist"
                className="ml-auto text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                View Wishlist
              </Link>
            </div>

            <div
              id="error-message"
              className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2 animate-fade-in hidden"
            >
              <i className="fas fa-exclamation-circle text-red-500"></i>
              <span>Failed to update wishlist. Please try again.</span>
              <button
                className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                onClick={() => {
                  const errorMessage = document.getElementById("error-message");
                  if (errorMessage) {
                    errorMessage.classList.add("hidden");
                  }
                }}
              >
                Dismiss
              </button>
            </div>

            {product.categories && product.categories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.slug}`}
                      className="inline-block bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm hover:bg-sky-100 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Replace the old tabs implementation with our new ProductInfoTabs component */}
            <ProductInfoTabs product={product} />

            <div className="mt-10 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-3">
                Delivery & Returns
              </h3>
              <div className="flex items-start gap-3">
                <div className="text-sky-600 mt-1">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Free Shipping</p>
                  <p className="text-sm text-gray-600">
                    Estimated delivery within 3-5 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <div className="text-sky-600 mt-1">
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Easy Returns</p>
                  <p className="text-sm text-gray-600">
                    10 days return policy with full refund
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProductDetail;