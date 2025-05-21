import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../context/CheckoutContenxt";
import { useAuth } from "../context/AuthContext";
import AddressForm from "../components/checkout/AddressForm";
import CheckoutSummary from "../components/checkout/CheckoutSummary";
import DeliveryOptions from "../components/checkout/DeliveryOptions";
import PaymentForm from "../components/checkout/PaymentForm";
import OrderReview from "../components/checkout/OrderReview";
import OrderComplete from "../components/checkout/OrderComplete";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const {
    activeStep,
    goToNextStep,
    goToPrevStep,
    cartItems,
    errors,
    clearErrors,
    isProcessingOrder,
    orderComplete,
    orderDetails,
    createDraftOrder,
    draftOrder,
    addressData,
    selectedShippingMethod,
    selectedPaymentMethod,
    paymentData,
    totalAmount,
    shippingCost,
    taxAmount,
    discountAmount = 0,
    totalOrderAmount,
    submitOrder,
  } = useCheckout();

  const [isLoading, setIsLoading] = useState(true);

  // Steps for the checkout process
  const steps = [
    { id: 0, name: "Shipping", component: AddressForm },
    { id: 1, name: "Delivery", component: DeliveryOptions },
    { id: 2, name: "Payment", component: PaymentForm },
    { id: 3, name: "Review", component: OrderReview },
  ];

  const orderReviewProps = {
    addressData,
    selectedShipping: selectedShippingMethod,
    selectedPaymentMethod,
    paymentData,
    cartTotal: totalAmount,
    shippingCost,
    taxAmount,
    discountAmount,
    orderTotal: totalOrderAmount,
    items: cartItems,
    onPlaceOrder: submitOrder,
  };

  // Initialize checkout on component mount
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setIsLoading(true);

        // If cart is empty, check if we have a draft order
        if (!cartItems || cartItems.length === 0) {
          const existingDraftId = localStorage.getItem("checkoutDraftOrderId");
          if (!existingDraftId || existingDraftId === "undefined") {
            // No draft order and no cart items, redirect to cart
            navigate("/cart");
            return;
          }
        }

        // Create or load draft order if one doesn't exist yet
        if (!draftOrder) {
          console.log("No draft order found in checkout, creating one");
          await createDraftOrder();
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
        // Redirect to cart on error
        navigate("/cart");
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, [cartItems, draftOrder, createDraftOrder, navigate]);

  // Display errors when they occur
  useEffect(() => {
    if (errors.length > 0) {
      // Show first error
      alert(errors[0]);
      clearErrors();
    }
  }, [errors, clearErrors]);

  // If checkout is complete, show order complete page
  if (orderComplete && orderDetails) {
    return <OrderComplete order={orderDetails} />;
  }

  // Get current step component
  const StepComponent = steps[activeStep]?.component || AddressForm;

  // Handle continue button click
  const handleContinue = () => {
    clearErrors();
    goToNextStep();
  };

  // Handle back button click
  const handleBack = () => {
    clearErrors();
    goToPrevStep();
  };

  // Handle authentication prompt
  const handleAuthPrompt = () => {
    openAuthModal("login");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-600 rounded-lg">
          <h3 className="font-semibold mb-2">
            Please fix the following issues:
          </h3>
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main checkout form */}
          <div className="lg:w-2/3">
            {/* Checkout steps */}
            <div className="mb-6">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    {/* Step indicator */}
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full ${
                          activeStep >= step.id
                            ? "bg-sky-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {activeStep > step.id ? (
                          <i className="fas fa-check text-sm"></i>
                        ) : (
                          <span className="text-sm">{step.id + 1}</span>
                        )}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          activeStep >= step.id
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          activeStep > step.id ? "bg-sky-600" : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Authentication prompt for guest users */}
            {!isAuthenticated && activeStep === 0 && (
              <div className="mb-6 p-4 border border-gray-200 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-user-circle text-gray-400 text-2xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Returning customer?
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sign in for faster checkout and access to order history.
                    </p>
                  </div>
                  <button
                    onClick={handleAuthPrompt}
                    className="ml-auto bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Current step component */}
            <div className="mb-6">
              {activeStep === 3 ? (
                <OrderReview {...orderReviewProps} />
              ) : (
                // @ts-ignore
                <StepComponent />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              {activeStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                  disabled={isProcessingOrder}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back
                </button>
              )}

              <button
                onClick={handleContinue}
                className="ml-auto px-6 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200 disabled:bg-gray-400 flex items-center"
                disabled={isProcessingOrder}
              >
                {isProcessingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {activeStep < steps.length - 1 ? (
                      <>
                        Continue
                        <i className="fas fa-arrow-right ml-2"></i>
                      </>
                    ) : (
                      <>
                        Place Order
                        <i className="fas fa-check-circle ml-2"></i>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-1/3">
            <CheckoutSummary showDetails />
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;