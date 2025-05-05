import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/CheckoutContenxt";
// import { useAuth } from "../../context/AuthContext";

const AddressForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    addressData, 
    handleAddressChange, 
    handleCheckboxChange,
    isAuthenticated,
    savedAddresses,
    fetchSavedAddresses,
    loadSavedAddress,
    isAddressValid,
    addressValidationMessage,
    goToNextStep,
    validateAddress
  } = useCheckout();
  
  // const { user } = useAuth();

  // Fetch saved addresses if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedAddresses();
    }
  }, [isAuthenticated, fetchSavedAddresses]);

  // Handle address selection
  const handleAddressSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = parseInt(e.target.value, 10);
    if (addressId > 0) {
      loadSavedAddress(addressId);
    }
  };

  // Navigate back to cart
  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Handle continue to next step
  const handleNextStep = async () => {
    const isValid = await validateAddress();
    if (isValid) {
      goToNextStep();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Shipping Information
      </h2>

      {/* Saved addresses for authenticated users */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="mb-6">
          <label
            htmlFor="savedAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Use a saved address
          </label>
          <select
            id="savedAddress"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            onChange={handleAddressSelection}
            defaultValue=""
          >
            <option value="">Select a saved address</option>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.address}, {address.city}, {address.state} (
                {address.isDefault ? "Default" : ""})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error message */}
      {!isAddressValid && addressValidationMessage && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-600 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {addressValidationMessage}
        </div>
      )}

      {/* Address form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Email *
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
            placeholder="e.g. 078XXXXXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
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

        <div className="md:col-span-2">
          <label
            htmlFor="address2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Apartment, Suite, Unit, etc. (optional)
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={addressData.address2 || ""}
            onChange={handleAddressChange}
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
            <option value="">Select a country</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Uganda">Uganda</option>
            <option value="Kenya">Kenya</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Burundi">Burundi</option>
          </select>
        </div>
      </div>

      {/* Save address checkbox for authenticated users */}
      {isAuthenticated && (
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="address.saveAddress"
              checked={addressData.saveAddress}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <span className="ml-2 text-gray-700 text-sm">
              Save this address for future orders
            </span>
          </label>
        </div>
      )}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBackToCart}
          className="text-sky-600 hover:text-sky-800 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Cart
        </button>

        <button
          onClick={handleNextStep}
          className="bg-sky-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
          disabled={!isAddressValid}
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );
};

export default AddressForm;