import React, { useEffect } from "react";
import { CartItem } from "../../context/CartContext";

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
  totalSavings: number;
  shippingCost: number;
  taxAmount: number;
  totalOrderAmount: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponApplied: boolean;
  setCouponApplied: (applied: boolean) => void;
  applyCoupon: () => void;
  isLoading: boolean;
  handleProceedToCheckout: () => void;
  isProcessingCheckout: boolean;
  selectedShipping: any;
  showDetails: boolean;
  onPriceUpdate?: (prices: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }) => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  totalAmount,
  totalSavings,
  shippingCost,
  taxAmount,
  totalOrderAmount,
  couponCode,
  setCouponCode,
  couponApplied,
  setCouponApplied,
  applyCoupon,
  isLoading,
  selectedShipping,
  showDetails,
  onPriceUpdate,
}) => {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (value: number) => {
    return `Rwf ${value.toLocaleString()}`;
  };

  // Notify parent component of price updates
  useEffect(() => {
    if (onPriceUpdate) {
      const total = totalAmount + shippingCost + taxAmount;
      onPriceUpdate({
        subtotal: totalAmount,
        shipping: shippingCost,
        tax: taxAmount,
        total: total
      });
    }
  }, [totalAmount, shippingCost, taxAmount, onPriceUpdate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 sticky top-24">
        {/* Order Summary Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Subtotal ({itemCount} items)
              </span>
              <span className="text-gray-800 font-medium">
                Rwf{totalAmount.toLocaleString()}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Total Savings</span>
                <span>-Rwf{totalSavings.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-800 font-medium">
                {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                {selectedShipping && showDetails && (
                  <span className="block text-xs text-gray-500">{selectedShipping.name}</span>
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18% VAT)</span>
              <span className="text-gray-800 font-medium">
                Rwf{Math.round(taxAmount).toLocaleString()}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-800">Total Amount</span>
                <span className="text-gray-900">
                  Rwf{Math.round(totalOrderAmount).toLocaleString()}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  You're saving Rwf{totalSavings.toLocaleString()} on this order
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
                    {couponCode}
                  </p>
                  <p className="text-xs text-green-600">Discount applied</p>
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
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
  );
};

export default OrderSummary;