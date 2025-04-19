// src/pages/Cart.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";

const Cart: React.FC = () => {
  // Use the cart context instead of local state for items
  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalSavings,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate additional values
  const discount = couponApplied ? Math.round(totalAmount * 0.1) : 0; // 10% discount example
  const shippingCost = totalAmount > 5000 ? 0 : 149; // Free shipping over Rwf5000
  const total = totalAmount - discount + shippingCost;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Apply coupon handler
  const applyCoupon = () => {
    if (!couponCode.trim()) return;

    setIsLoading(true);

    // Simulate API call to validate coupon
    setTimeout(() => {
      if (couponCode.toLowerCase() === "save10") {
        setCouponApplied(true);
      } else {
        alert("Invalid coupon code");
      }
      setIsLoading(false);
    }, 800);
  };

  // Clear cart confirmation
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Cart Section */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">
                  Shopping Cart{" "}
                  {itemCount > 0 &&
                    `(${itemCount} ${itemCount === 1 ? "item" : "items"})`}
                </h1>

                {itemCount > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <i className="fas fa-trash-alt"></i>
                    <span className="hidden sm:inline">Clear Cart</span>
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="py-16 px-4 text-center">
                  <div className="text-gray-300 text-6xl mb-4">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <h2 className="text-xl text-gray-700 mb-2">
                    Your cart is empty
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <Link
                    to="/"
                    className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-grow">
                            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-1">
                              {item.name}
                            </h3>

                            {item.variant && (
                              <p className="text-sm text-gray-500 mb-2">
                                Variant: {item.variant}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                              <div className="flex items-center">
                                <span className="text-lg font-semibold text-gray-800">
                                  Rwf{item.price.toLocaleString()}
                                </span>

                                {item.originalPrice && (
                                  <>
                                    <span className="ml-2 text-sm text-gray-500 line-through">
                                      Rwf{item.originalPrice.toLocaleString()}
                                    </span>
                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                      {Math.round(
                                        ((item.originalPrice - item.price) /
                                          item.originalPrice) *
                                          100
                                      )}
                                      % OFF
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="text-sm text-gray-500">
                                <i className="fas fa-check-circle text-green-500 mr-1"></i>
                                In Stock
                                {item.stock < 5 && (
                                  <span className="text-orange-500 ml-1">
                                    (Only {item.stock} left)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.id,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    className="px-3 py-1 text-gray-600 hover:text-sky-600 border-r border-gray-300"
                                    disabled={item.quantity <= 1}
                                    aria-label="Decrease quantity"
                                  >
                                    <i className="fas fa-minus text-xs"></i>
                                  </button>
                                  <span className="px-3 py-1 text-gray-800 min-w-[30px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="px-3 py-1 text-gray-600 hover:text-sky-600 border-l border-gray-300"
                                    disabled={item.quantity >= item.stock}
                                    aria-label="Increase quantity"
                                  >
                                    <i className="fas fa-plus text-xs"></i>
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                  <span className="hidden sm:inline">
                                    Remove
                                  </span>
                                </button>
                              </div>

                              <div className="text-base font-semibold text-gray-800">
                                Rwf
                                {(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Continue Shopping Button */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <Link
                      to="/"
                      className="text-sky-600 hover:text-sky-800 flex items-center gap-2"
                    >
                      <i className="fas fa-arrow-left"></i>
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 sticky top-24">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Subtotal ({itemCount} items)
                      </span>
                      <span className="text-gray-800">
                        Rwf{totalAmount.toLocaleString()}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Total Savings</span>
                        <span>-Rwf{totalSavings.toLocaleString()}</span>
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (Coupon Applied)</span>
                        <span>-Rwf{discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span
                        className={
                          shippingCost === 0
                            ? "text-green-600"
                            : "text-gray-800"
                        }
                      >
                        {shippingCost === 0 ? "FREE" : `Rwf${shippingCost}`}
                      </span>
                    </div>

                    {shippingCost > 0 && (
                      <div className="text-xs text-gray-500">
                        Add Rwf{(5000 - totalAmount).toLocaleString()} more for
                        free shipping
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-800">Total Amount</span>
                        <span className="text-gray-900">
                          Rwf{total.toLocaleString()}
                        </span>
                      </div>
                      {(totalSavings > 0 || discount > 0) && (
                        <div className="text-xs text-green-600 mt-1">
                          You're saving Rwf
                          {(totalSavings + discount).toLocaleString()} on this
                          order
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-tag text-sky-600"></i>
                    <h3 className="font-medium text-gray-800">Apply Coupon</h3>
                  </div>

                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            SAVE10
                          </p>
                          <p className="text-xs text-green-600">
                            10% off applied
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCouponApplied(false)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={isLoading || !couponCode.trim()}
                        className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    <p>Try coupon code: SAVE10 for 10% off</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="p-6">
                  <Link
                    to="/checkout"
                    className="w-full bg-sky-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-sky-700 transition-colors duration-200"
                  >
                    Proceed to Checkout
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                    <i className="fas fa-lock"></i>
                    Secure Checkout
                  </div>

                  {/* Payment Method Icons */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center justify-center w-10 h-6 bg-blue-600 rounded text-white">
                      <i className="fab fa-cc-visa text-lg"></i>
                    </div>
                    <div className="flex items-center justify-center w-10 h-6 bg-gray-800 rounded text-white">
                      <i className="fab fa-cc-mastercard text-lg"></i>
                    </div>
                    <div className="flex items-center justify-center w-10 h-6 bg-blue-500 rounded text-white">
                      <i className="fab fa-cc-amex text-lg"></i>
                    </div>
                    <div className="flex items-center justify-center w-10 h-6 bg-blue-700 rounded text-white">
                      <i className="fab fa-paypal text-lg"></i>
                    </div>
                    <div className="flex items-center justify-center w-10 h-6 bg-green-600 rounded text-white">
                      <i className="fas fa-mobile-alt text-lg"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
