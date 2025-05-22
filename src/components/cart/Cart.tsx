import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import orderApi from '../../utils/orderApi';
import { showToast } from '../ui/ToastProvider';
import { DraftOrder } from '../../context/CheckoutContenxt';
import OrderSummary from '../checkout/OrderSummary';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalOrderAmount, setTotalOrderAmount] = useState(totalAmount * 1.18); // Including VAT
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(totalAmount * 0.18);

  const handlePriceUpdate = (prices: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }) => {
    setTotalOrderAmount(prices.total);
    setShippingCost(prices.shipping);
    setTaxAmount(prices.tax);
  };

  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      showToast.error("Your cart is empty. Please add items before proceeding to checkout.");
      return;
    }

    try {
      // Clear any existing draft order ID from localStorage
      localStorage.removeItem("checkoutDraftOrderId");
      
      // Transform cart items to order items using the API's transformation function
      const formattedItems = orderApi.transformCartToOrderItems(cartItems);

      // Calculate total items
      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      // Use the totalOrderAmount from OrderSummary
      const draftOrderPayload: Partial<DraftOrder> = {
        items: formattedItems,
        subtotal: totalAmount,
        tax: taxAmount,
        shipping: shippingCost,
        total: totalOrderAmount,
        totalItems: totalItems,
        status: 'draft',
        orderNumber: `DRAFT-${Date.now()}`,
        paymentStatus: 'pending'
      };

      const response = await orderApi.createDraftOrder(draftOrderPayload);
      
      if (response && response.id) {
        // Store the draft order ID in localStorage as a string
        localStorage.setItem('checkoutDraftOrderId', String(response.id));
        // Navigate to checkout
        navigate('/checkout');
      } else {
        showToast.error('Failed to create draft order');
      }
    } catch (error) {
      console.error('Error creating draft order:', error);
      showToast.error('Failed to create draft order');
    }
  };

  const applyCoupon = () => {
    // Implement coupon logic here
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showToast.error('Coupon functionality not implemented yet');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Cart items list */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Shopping Cart</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        Rwf{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            cartItems={cartItems}
            totalAmount={totalAmount}
            totalSavings={0}
            shippingCost={shippingCost}
            taxAmount={taxAmount}
            totalOrderAmount={totalOrderAmount}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            setCouponApplied={setCouponApplied}
            applyCoupon={applyCoupon}
            isLoading={isLoading}
            handleProceedToCheckout={handleProceedToCheckout}
            isProcessingCheckout={false}
            selectedShipping={null}
            showDetails={true}
            onPriceUpdate={handlePriceUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart; 