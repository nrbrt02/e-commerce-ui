import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/CheckoutContenxt";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

// Import checkout components
import CheckoutProgress from "./CheckoutProgress";
import AddressForm from "./AddressForm";
import DeliveryOptions from "./DeliveryOptions";
import OrderSummary from "./OrderSummary";
import PaymentMethods from "./PaymentMethods";
import CardPaymentForm from "./CardPaymentForm";
import PayPalPayment from "./PayPalPayment";
import OrderReview from "./OrderReview";
import OrderComplete from "./OrderComplete";
import EmptyCart from "./EmptyCart";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();

  // Add the missing state variables
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const {
    activeStep,
    goToNextStep,
    goToPrevStep,
    goToStep,
    cartItems,
    totalAmount,
    totalSavings,
    shippingCost,
    taxAmount,
    totalOrderAmount,
    isProcessingOrder,
    submitOrder,
    orderComplete,
    orderDetails,
    errors,
    clearErrors,
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentData,
    handlePaymentChange,
    handleCheckboxChange,
    addressData,
    validatePayment,
    deliveryOptions,
    selectedShippingMethod,
  } = useCheckout();

  const cartContext = useCart();
  const { isAuthenticated } = useAuth();

  // Calculate the total (was missing)
  const total =
    totalAmount - (couponApplied ? totalAmount * 0.1 : 0) + shippingCost;

  // Add the missing applyCoupon function
  const applyCoupon = () => {
    if (!couponCode.trim()) return;

    setIsLoading(true);

    // Simulate API call to validate coupon
    setTimeout(() => {
      if (couponCode.toLowerCase() === "save10") {
        setCouponApplied(true);
        // You might want to use a toast notification here
        alert("Coupon applied successfully!");
      } else {
        alert("Invalid coupon code");
      }
      setIsLoading(false);
    }, 800);
  };

  // Add the missing handleProceedToCheckout function
  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert(
        "Your cart is empty. Please add items before proceeding to checkout."
      );
      return;
    }

    setIsProcessingCheckout(true);
    // Your checkout logic here
    // For now, just navigate to the first checkout step
    navigate("/checkout");
    setIsProcessingCheckout(false);
  };

  // Display errors when they occur
  useEffect(() => {
    if (errors.length > 0) {
      alert(errors[0]);
      clearErrors();
    }
  }, [errors, clearErrors]);

  // Redirect to cart if cart is empty
  if (cartContext.cartItems.length === 0 && !orderComplete) {
    return <Navigate to="/cart" />;
  }

  // Show empty cart component if there are no items
  if (cartItems.length === 0 && !orderComplete) {
    return <EmptyCart />;
  }

  // Show order complete page if order is complete
  if (orderComplete && orderDetails) {
    return (
      <OrderComplete
        orderId={orderDetails.orderNumber}
        email={addressData.email}
        totalAmount={totalAmount}
        shippingCost={shippingCost}
        taxAmount={taxAmount}
        totalOrderAmount={totalOrderAmount}
        onContinueShopping={() => navigate("/")}
      />
    );
  }

  // Handle back to cart
  const handleBackToCart = () => {
    navigate("/cart");
  };

  // Handle payment submission validation
  const handlePaymentSubmit = async () => {
    const isValid = await validatePayment();
    if (isValid) {
      goToNextStep();
    }
  };

  // Handle final order submission
  const handleSubmitOrder = () => {
    submitOrder()
      .then(() => {
        navigate("/checkout/success");
      })
      .catch((error) => {
        console.error("Error submitting order:", error);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Checkout
      </h1>

      {/* Checkout progress */}
      <CheckoutProgress activeStep={activeStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main checkout content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Step 1: Address Form */}
            {activeStep === 0 && (
              <AddressForm
                onBackToCart={handleBackToCart}
                onNextStep={goToNextStep}
              />
            )}

            {/* Step 2: Shipping Method */}
            {activeStep === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Shipping Method
                </h2>

                <DeliveryOptions />

                <div className="flex justify-between mt-8">
                  <button
                    onClick={goToPrevStep}
                    className="text-sky-600 hover:text-sky-800 flex items-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Address
                  </button>

                  <button
                    onClick={goToNextStep}
                    className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                    disabled={!selectedShippingMethod}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {activeStep === 2 && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Payment Method
                </h2>

                <PaymentMethods
                  methods={paymentMethods}
                  selectedMethod={selectedPaymentMethod}
                  onSelectMethod={setSelectedPaymentMethod}
                />

                {selectedPaymentMethod === "card" && (
                  <CardPaymentForm
                    paymentData={paymentData}
                    isAuthenticated={isAuthenticated}
                    onPaymentChange={handlePaymentChange}
                    onCheckboxChange={handleCheckboxChange}
                  />
                )}

                {selectedPaymentMethod === "paypal" && (
                  <PayPalPayment
                    clientId={import.meta.env.VITE_PAYPAL_CLIENT_ID || "test"}
                    amount={totalOrderAmount}
                    itemCount={cartItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                    onSuccess={goToNextStep}
                    onError={(error) => console.error("PayPal error:", error)}
                    onCancel={() => console.log("PayPal payment cancelled")}
                  />
                )}

                {(selectedPaymentMethod === "mobilemoney" ||
                  selectedPaymentMethod === "cod") && (
                  <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      {selectedPaymentMethod === "mobilemoney" ? (
                        <div>
                          <p className="text-gray-700 mb-2">
                            You'll receive payment instructions on your phone.
                          </p>
                          <p className="text-gray-600 text-sm">
                            We'll send a payment request to the phone number you
                            provided: <strong>{addressData.phone}</strong>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-700 mb-2">
                            You'll pay when your order is delivered.
                          </p>
                          <p className="text-gray-600 text-sm">
                            Please ensure you have the exact amount of{" "}
                            <strong>
                              Rwf{totalOrderAmount.toLocaleString()}
                            </strong>{" "}
                            ready for our delivery person.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={goToPrevStep}
                    className="text-sky-600 hover:text-sky-800 flex items-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Shipping
                  </button>

                  <button
                    onClick={handlePaymentSubmit}
                    className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Order Review */}
            {activeStep === 3 && (
              <OrderReview
                addressData={addressData}
                selectedShipping={selectedShippingMethod}
                selectedPaymentMethod={selectedPaymentMethod}
                paymentData={paymentData}
                items={cartItems}
                deliveryOptions={deliveryOptions}
                paymentMethods={paymentMethods}
                isLoading={isProcessingOrder}
                onEditShipping={() => goToStep(1)}
                onEditPayment={() => goToStep(2)}
                onPrevStep={goToPrevStep}
                onSubmitOrder={handleSubmitOrder}
              />
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            cartItems={cartItems}
            totalAmount={totalAmount}
            totalSavings={totalSavings}
            shippingCost={shippingCost}
            taxAmount={taxAmount}
            totalOrderAmount={total}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            setCouponApplied={setCouponApplied}
            applyCoupon={applyCoupon}
            isLoading={isLoading}
            handleProceedToCheckout={handleProceedToCheckout}
            isProcessingCheckout={isProcessingCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
