// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { ApiProduct } from '../hooks/useProducts';

interface ProductImage {
  url: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [parsedImages, setParsedImages] = useState<string[]>([]);
  
  // Get API base URL from environment variables
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  const { addToCart } = useCart();
  
  // Fetch product details with the correct API URL
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const endpoint = `${apiBaseUrl}/products/${id}`;
        console.log('Fetching product details from:', endpoint);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data && data.data.product) {
          setProduct(data.data.product);
          
          // Parse image URLs
          const images = parseImageUrls(data.data.product.imageUrls);
          setParsedImages(images);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // If direct product fetch fails, try to get from all products
        try {
          const allProductsEndpoint = `${apiBaseUrl}/products`;
          console.log('Trying to fetch from all products:', allProductsEndpoint);
          
          const allProductsResponse = await fetch(allProductsEndpoint);
          
          if (!allProductsResponse.ok) {
            throw new Error(`Failed to fetch products: ${allProductsResponse.status} ${allProductsResponse.statusText}`);
          }
          
          const allProductsData = await allProductsResponse.json();
          
          if (allProductsData.status === 'success' && allProductsData.data && allProductsData.data.products) {
            // Find the product with the matching ID
            const foundProduct = allProductsData.data.products.find(
              (p: ApiProduct) => p.id === parseInt(id || '0')
            );
            
            if (foundProduct) {
              setProduct(foundProduct);
              
              // Parse image URLs
              const images = parseImageUrls(foundProduct.imageUrls);
              setParsedImages(images);
              
              // Clear the error since we found the product
              setError(null);
            } else {
              setError('Product not found');
            }
          } else {
            throw new Error('Invalid data format received from API');
          }
        } catch (fallbackErr) {
          console.error('Error in fallback product fetch:', fallbackErr);
          // Keep the original error
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProductDetails();
    }
  }, [id, apiBaseUrl]);
  
  // Parse image URLs from JSON strings
  const parseImageUrls = (imageUrlsJson: string[]): string[] => {
    if (!imageUrlsJson || !Array.isArray(imageUrlsJson) || imageUrlsJson.length === 0) {
      return ["/api/placeholder/400/400"]; // Fallback image
    }
    
    try {
      return imageUrlsJson.map(imageJson => {
        const parsed = JSON.parse(imageJson) as ProductImage;
        // Handle both local and remote URLs
        if (parsed.url.startsWith('http')) {
          return parsed.url;
        } else {
          // For demo purposes, use a placeholder
          return "/api/placeholder/400/400";
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
    
    addToCart({
      id: product.id,
      name: product.name,
      image: parsedImages[0],
      price: parseFloat(product.price),
      originalPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : undefined,
      quantity: quantity,
      stock: product.quantity
    }, navigateToCart);
    
    // Only show added to cart message if we're not navigating away
    if (!navigateToCart) {
      // Show added to cart message
      setIsAddedToCart(true);
      
      // Reset message after 3 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 3000);
    }
  };
  
  // Calculate discount percentage
  const calculateDiscount = (price: string, compareAtPrice: string | null): number => {
    if (!compareAtPrice) return 0;
    
    const currentPrice = parseFloat(price);
    const originalPrice = parseFloat(compareAtPrice);
    
    if (originalPrice <= currentPrice) return 0;
    
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            {/* Product Images Skeleton */}
            <div className="lg:w-2/5">
              <div className="aspect-square rounded-lg bg-gray-200 mb-4"></div>
              <div className="flex gap-2 mt-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="w-16 h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            {/* Product Details Skeleton */}
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
      </Layout>
    );
  }
  
  // Error state
  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="text-red-500 text-5xl mb-4">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || "Product not found"}
            </h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the product you're looking for. It might have been removed or is no longer available.
            </p>
            <Link 
              to="/"
              className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
            >
              Back to Homepage
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Calculate discount and other product values
  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const isLowStock = product.quantity <= product.lowStockThreshold && product.lowStockThreshold > 0;
  const isSoldOut = product.quantity === 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Product Breadcrumbs */}
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
                  <svg className="w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  {product.categories && product.categories.length > 0 ? (
                    <Link to={`/category/${product.categories[0].slug}`} className="hover:text-sky-600 transition-colors">
                      {product.categories[0].name}
                    </Link>
                  ) : (
                    <span>Products</span>
                  )}
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-2/5">
            <div className="sticky top-24">
              <div className="aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 mb-4">
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                    <span className="text-white font-bold text-xl">SOLD OUT</span>
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
                        activeImage === index ? 'border-sky-500' : 'border-gray-200'
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
          
          {/* Product Details */}
          <div className="lg:w-3/5">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-500">SKU:</span>
                <span className="ml-1 text-gray-700">{product.sku}</span>
              </div>
              
              {product.supplier && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500">Sold by:</span>
                  <span className="ml-1 text-gray-700">{product.supplier.username}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                  {isSoldOut ? 'Out of Stock' : 'In Stock'}
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
            
            {/* Price */}
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
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>
            
            {/* Tags */}
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
            
            {/* Quantity and Add to Cart */}
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
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-sky-600 text-white hover:bg-sky-700 transition-colors duration-200'
                  }`}
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Add to Cart
                </button>
                
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isSoldOut}
                  className={`h-12 px-4 font-medium rounded-md flex items-center justify-center ${
                    isSoldOut 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-sky-800 text-white hover:bg-sky-900 transition-colors duration-200'
                  }`}
                >
                  <i className="fas fa-bolt mr-2"></i>
                  Buy Now
                </button>
              </div>
              
              <button
                className="h-12 w-12 border border-gray-300 rounded-md text-gray-600 hover:text-red-500 hover:border-red-500 transition-colors duration-200"
                aria-label="Add to wishlist"
              >
                <i className="far fa-heart"></i>
              </button>
            </div>
            
            {/* Added to cart message */}
            {isAddedToCart && (
              <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2 animate-fade-in">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Item added to your cart successfully!</span>
                <Link to="/cart" className="ml-auto text-sky-600 hover:text-sky-700 text-sm font-medium">
                  View Cart
                </Link>
              </div>
            )}
            
            {/* Product Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map(category => (
                    <Link 
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="inline-block bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm hover:bg-sky-100 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Product Details Tabs */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <div className="border-b border-gray-200 mb-4">
                <ul className="flex flex-wrap -mb-px">
                  <li className="mr-2">
                    <button className="inline-block py-2 px-4 text-sky-600 border-b-2 border-sky-600 font-medium">
                      Description
                    </button>
                  </li>
                  <li className="mr-2">
                    <button className="inline-block py-2 px-4 text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300">
                      Specifications
                    </button>
                  </li>
                  <li className="mr-2">
                    <button className="inline-block py-2 px-4 text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300">
                      Reviews
                    </button>
                  </li>
                </ul>
              </div>
              
              <div className="prose prose-sky max-w-none">
                <p>{product.description}</p>
                
                {product.shortDescription && (
                  <p className="mt-4">{product.shortDescription}</p>
                )}
                
                {/* Product Physical Details */}
                {!product.isDigital && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Product Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Dimensions</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Width</p>
                            <p className="font-medium">{product.dimensions.width} cm</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Height</p>
                            <p className="font-medium">{product.dimensions.height} cm</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-sm">Length</p>
                            <p className="font-medium">{product.dimensions.length} cm</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Weight</h4>
                        <p className="text-center text-lg font-medium">{product.weight} g</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Delivery Options */}
            <div className="mt-10 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-3">Delivery & Returns</h3>
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
    </Layout>
  );
};

export default ProductDetail;