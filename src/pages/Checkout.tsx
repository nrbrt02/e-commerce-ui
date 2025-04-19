// src/pages/Checkout.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// Define form data types
interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  saveAddress: boolean;
}

interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const { cartItems, totalAmount, totalSavings, clearCart } = useCart();

  // Checkout steps
  const [activeStep, setActiveStep] = useState<number>(isAuthenticated ? 1 : 0);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");

  // Form states
  const [addressData, setAddressData] = useState<AddressFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Rwanda",
    saveAddress: true,
  });

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    saveCard: false,
  });

  // Selected options states
  const [selectedShipping, setSelectedShipping] = useState<string>("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");

  // Delivery options
  const deliveryOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Delivery within 3-5 business days",
      price: totalAmount > 5000 ? 0 : 149,
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "Delivery within 1-2 business days",
      price: 499,
    },
    {
      id: "pickup",
      name: "Store Pickup",
      description: "Collect from our store in Kigali",
      price: 0,
    },
  ];

  // Payment methods
  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "fa-credit-card" },
    { id: "mobilemoney", name: "Mobile Money", icon: "fa-mobile-alt" },
    { id: "bank", name: "Bank Transfer", icon: "fa-university" },
  ];

  // Calculate order summary values
  const shippingCost =
    deliveryOptions.find((option) => option.id === selectedShipping)?.price ||
    0;
  const taxAmount = Math.round(totalAmount * 0.18); // 18% VAT
  const totalOrderAmount = totalAmount + shippingCost + taxAmount;

  // Format credit card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format card expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  // Handle address form changes
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name.includes("payment")) {
      setPaymentData((prev) => ({
        ...prev,
        [name.replace("payment.", "")]: checked,
      }));
    } else {
      setAddressData((prev) => ({
        ...prev,
        [name.replace("address.", "")]: checked,
      }));
    }
  };

  // Handle payment form changes
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      setPaymentData((prev) => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === "expiryDate") {
      setPaymentData((prev) => ({ ...prev, [name]: formatExpiryDate(value) }));
    } else if (name === "cvv") {
      setPaymentData((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, "").substring(0, 3),
      }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Proceed to next step
  const handleNextStep = () => {
    setActiveStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  // Go back to previous step
  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
    window.scrollTo(0, 0);
  };

  // Handle login requirement
  const handleLoginRequirement = () => {
    openAuthModal("login");
  };

  // Submit order
  const handleSubmitOrder = () => {
    setIsLoading(true);

    // Simulate order processing with timeout
    setTimeout(() => {
      // Generate random order ID
      const generatedOrderId =
        "FS" +
        Date.now().toString().substring(7) +
        Math.floor(Math.random() * 1000);
      setOrderId(generatedOrderId);
      setOrderComplete(true);
      clearCart();
      setIsLoading(false);
      window.scrollTo(0, 0);
    }, 2000);
  };

  // Handle continue shopping after order is complete
  const handleContinueShopping = () => {
    navigate("/");
  };

  // Check if cart is empty
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-lg mx-auto">
            <div className="text-gray-400 text-6xl mb-6">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              You need to add items to your cart before proceeding to checkout.
            </p>
            <Link
              to="/"
              className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Render order complete page
  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-3xl text-green-600"></i>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order has been confirmed.
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
                <p className="font-medium text-gray-800">
                  Order ID: <span className="text-sky-600">{orderId}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  A confirmation email has been sent to {addressData.email}
                </p>
              </div>

              <div className="text-left mb-8">
                <h3 className="font-medium text-gray-800 mb-3">
                  Order Details:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Total:</span>
                    <span>Rwf{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>
                      {shippingCost === 0
                        ? "Free"
                        : `Rwf${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>Rwf{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-gray-200 pt-2 mt-2">
                    <span>Total:</span>
                    <span>Rwf{totalOrderAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleContinueShopping}
                  className="bg-sky-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                >
                  Continue Shopping
                </button>
                <Link
                  to="/account?tab=orders"
                  className="border border-sky-600 text-sky-600 px-6 py-3 rounded-lg font-medium hover:bg-sky-50 transition-colors duration-200"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>

          {/* Checkout Progress */}
          <div className="flex items-center justify-center max-w-3xl mx-auto mb-6">
            <div className="flex items-center w-full">
              <div
                className={`flex flex-col items-center ${
                  activeStep >= 0 ? "text-sky-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    activeStep >= 0
                      ? "border-sky-600 bg-sky-50"
                      : "border-gray-300"
                  } mb-1`}
                >
                  {activeStep > 0 ? (
                    <i className="fas fa-check text-sm"></i>
                  ) : (
                    <span className="text-sm font-medium">1</span>
                  )}
                </div>
                <span className="text-xs hidden sm:block">Account</span>
              </div>

              <div
                className={`flex-1 h-1 mx-2 ${
                  activeStep >= 1 ? "bg-sky-600" : "bg-gray-300"
                }`}
              ></div>

              <div
                className={`flex flex-col items-center ${
                  activeStep >= 1 ? "text-sky-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    activeStep >= 1
                      ? "border-sky-600 bg-sky-50"
                      : "border-gray-300"
                  } mb-1`}
                >
                  {activeStep > 1 ? (
                    <i className="fas fa-check text-sm"></i>
                  ) : (
                    <span className="text-sm font-medium">2</span>
                  )}
                </div>
                <span className="text-xs hidden sm:block">Shipping</span>
              </div>

              <div
                className={`flex-1 h-1 mx-2 ${
                  activeStep >= 2 ? "bg-sky-600" : "bg-gray-300"
                }`}
              ></div>

              <div
                className={`flex flex-col items-center ${
                  activeStep >= 2 ? "text-sky-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    activeStep >= 2
                      ? "border-sky-600 bg-sky-50"
                      : "border-gray-300"
                  } mb-1`}
                >
                  {activeStep > 2 ? (
                    <i className="fas fa-check text-sm"></i>
                  ) : (
                    <span className="text-sm font-medium">3</span>
                  )}
                </div>
                <span className="text-xs hidden sm:block">Payment</span>
              </div>

              <div
                className={`flex-1 h-1 mx-2 ${
                  activeStep >= 3 ? "bg-sky-600" : "bg-gray-300"
                }`}
              ></div>

              <div
                className={`flex flex-col items-center ${
                  activeStep >= 3 ? "text-sky-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    activeStep >= 3
                      ? "border-sky-600 bg-sky-50"
                      : "border-gray-300"
                  } mb-1`}
                >
                  <span className="text-sm font-medium">4</span>
                </div>
                <span className="text-xs hidden sm:block">Review</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
              {/* Step 0: Account Login/Register (only shown if not authenticated) */}
              {activeStep === 0 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Account
                  </h2>

                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="text-sky-600 mr-3">
                        <i className="fas fa-info-circle mt-1"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">
                          Login to your account
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Sign in to use your saved addresses and speed up
                          checkout.
                        </p>
                        <Link
                          to="/account"
                          className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors duration-200 inline-block"
                        >
                          Login / Register
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center my-6">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">Continue as guest:</p>
                    <button
                      onClick={handleNextStep}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                    >
                      Continue to Shipping
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Shipping Information */}
              {activeStep === 1 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={addressData.firstName}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={addressData.lastName}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={addressData.email}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={addressData.phone}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        placeholder="e.g. 078XXXXXXX"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={addressData.address}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={addressData.city}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Province/State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={addressData.state}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={addressData.postalCode}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={addressData.country}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                      >
                        <option value="Rwanda">Rwanda</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Burundi">Burundi</option>
                      </select>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <div className="mb-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="address.saveAddress"
                          checked={addressData.saveAddress}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="ml-2 text-gray-700">
                          Save this address for future orders
                        </span>
                      </label>
                    </div>
                  )}

                  <h3 className="font-medium text-gray-800 mb-3 mt-6">
                    Delivery Options
                  </h3>
                  <div className="space-y-3 mb-6">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                          selectedShipping === option.id
                            ? "border-sky-500 bg-sky-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingOption"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={() => setSelectedShipping(option.id)}
                          className="h-5 w-5 text-sky-600 border-gray-300 mt-0.5 focus:ring-sky-500"
                        />
                        <div className="ml-3 flex-grow">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-800">
                              {option.name}
                            </p>
                            <p className="font-medium text-gray-800">
                              {option.price === 0
                                ? "FREE"
                                : `Rwf${option.price.toLocaleString()}`}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <Link
                      to="/cart"
                      className="text-sky-600 hover:text-sky-800 flex items-center"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Cart
                    </Link>

                    <button
                      onClick={handleNextStep}
                      className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {activeStep === 2 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Payment Information
                  </h2>

                  <div className="mb-6">
                    <h3 className="font-medium text-gray-800 mb-3">
                      Payment Method
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedPaymentMethod === method.id
                              ? "border-sky-500 bg-sky-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() => setSelectedPaymentMethod(method.id)}
                            className="h-5 w-5 text-sky-600 border-gray-300 focus:ring-sky-500"
                          />
                          <div className="ml-3 flex items-center">
                            <i
                              className={`fas ${method.icon} text-gray-600 mr-2`}
                            ></i>
                            <span className="font-medium text-gray-800">
                              {method.name}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Credit Card Form */}
                  {selectedPaymentMethod === "card" && (
                    <div className="mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label
                              htmlFor="cardNumber"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Card Number *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={paymentData.cardNumber}
                                onChange={handlePaymentChange}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                required
                                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <i className="fab fa-cc-visa text-blue-700"></i>
                                <i className="fab fa-cc-mastercard text-gray-700"></i>
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label
                              htmlFor="cardName"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Cardholder Name *
                            </label>
                            <input
                              type="text"
                              id="cardName"
                              name="cardName"
                              value={paymentData.cardName}
                              onChange={handlePaymentChange}
                              placeholder="John Smith"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="expiryDate"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Expiry Date *
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              value={paymentData.expiryDate}
                              onChange={handlePaymentChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="cvv"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              CVV *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                id="cvv"
                                name="cvv"
                                value={paymentData.cvv}
                                onChange={handlePaymentChange}
                                placeholder="123"
                                maxLength={3}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <i
                                  className="fas fa-question-circle text-gray-400"
                                  title="3-digit security code on the back of your card"
                                ></i>
                              </div>
                            </div>
                          </div>
                        </div>

                        {isAuthenticated && (
                          <div className="mt-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="payment.saveCard"
                                checked={paymentData.saveCard}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                              />
                              <span className="ml-2 text-gray-700">
                                Save this card for future purchases
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                        <i className="fas fa-lock mr-2"></i>
                        <p>
                          Your payment information is encrypted and secure. We
                          never store full card details.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Form */}
                  {selectedPaymentMethod === "mobilemoney" && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label
                            htmlFor="mobileNumber"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Mobile Money Number *
                          </label>
                          <input
                            type="tel"
                            id="mobileNumber"
                            name="mobileNumber"
                            placeholder="07XXXXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            You will receive a prompt on your phone to complete
                            the payment.
                          </p>

                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="fas fa-info-circle text-blue-500"></i>
                            <p className="text-sm">
                              Make sure your phone is on and has sufficient
                              balance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Form */}
                  {selectedPaymentMethod === "bank" && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-gray-700 mb-4">
                        You will receive our bank account details after placing
                        your order. Please include your Order ID in the payment
                        reference.
                      </p>

                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
                        <p className="text-yellow-800">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Please note that your order will only be processed
                          after we confirm your payment.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrevStep}
                      className="text-sky-600 hover:text-sky-800 flex items-center"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Shipping
                    </button>

                    <button
                      onClick={handleNextStep}
                      className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Review */}
              {activeStep === 3 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Review Order
                  </h2>

                  {/* Customer Information Summary */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-800">
                        Customer Information
                      </h3>
                      <button
                        onClick={() => setActiveStep(1)}
                        className="text-sky-600 hover:text-sky-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Contact Information
                          </p>
                          <p className="text-gray-800">
                            {addressData.firstName} {addressData.lastName}
                          </p>
                          <p className="text-gray-800">{addressData.email}</p>
                          <p className="text-gray-800">{addressData.phone}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Shipping Address
                          </p>
                          <p className="text-gray-800">{addressData.address}</p>
                          <p className="text-gray-800">
                            {addressData.city}, {addressData.state}{" "}
                            {addressData.postalCode}
                          </p>
                          <p className="text-gray-800">{addressData.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method Summary */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-800">
                        Shipping Method
                      </h3>
                      <button
                        onClick={() => setActiveStep(1)}
                        className="text-sky-600 hover:text-sky-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-gray-800 font-medium">
                            {
                              deliveryOptions.find(
                                (option) => option.id === selectedShipping
                              )?.name
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {
                              deliveryOptions.find(
                                (option) => option.id === selectedShipping
                              )?.description
                            }
                          </p>
                        </div>
                        <p className="font-medium text-gray-800">
                          {shippingCost === 0
                            ? "FREE"
                            : `Rwf${shippingCost.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Summary */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-800">
                        Payment Method
                      </h3>
                      <button
                        onClick={() => setActiveStep(2)}
                        className="text-sky-600 hover:text-sky-800 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <i
                          className={`fas ${
                            paymentMethods.find(
                              (method) => method.id === selectedPaymentMethod
                            )?.icon
                          } text-gray-600 mr-2`}
                        ></i>
                        <p className="text-gray-800 font-medium">
                          {
                            paymentMethods.find(
                              (method) => method.id === selectedPaymentMethod
                            )?.name
                          }
                        </p>

                        {selectedPaymentMethod === "card" && (
                          <p className="ml-2 text-gray-500">
                            •••• {paymentData.cardNumber.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-800 mb-3">
                      Order Items
                    </h3>

                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 flex items-start gap-4"
                          >
                            <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-gray-800 font-medium">
                                    {item.name}
                                  </p>
                                  {item.variant && (
                                    <p className="text-sm text-gray-500">
                                      Variant: {item.variant}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>

                                <p className="font-medium text-gray-800">
                                  Rwf
                                  {(
                                    item.price * item.quantity
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrevStep}
                      className="text-sky-600 hover:text-sky-800 flex items-center"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Payment
                    </button>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={isLoading}
                      className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order
                          <i className="fas fa-check ml-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 sticky top-24">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Subtotal (
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items)
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

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span
                      className={
                        shippingCost === 0 ? "text-green-600" : "text-gray-800"
                      }
                    >
                      {shippingCost === 0
                        ? "FREE"
                        : `Rwf${shippingCost.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% VAT)</span>
                    <span className="text-gray-800">
                      Rwf{taxAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-800">Total Amount</span>
                      <span className="text-gray-900">
                        Rwf{totalOrderAmount.toLocaleString()}
                      </span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        You're saving Rwf{totalSavings.toLocaleString()} on this
                        order
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-600">
                  <i className="fas fa-lock"></i>
                  Secure Checkout
                </div>

                <div className="flex items-center justify-center gap-4">
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
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
