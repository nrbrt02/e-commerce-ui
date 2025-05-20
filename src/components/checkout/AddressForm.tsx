import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/CheckoutContenxt";
import { Address } from '../../types/address';
// import { useAuth } from "../../context/AuthContext";

interface AddressFormProps {
  type: 'shipping' | 'billing';
  onAddressChange?: (address: Address) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ type, onAddressChange }) => {
  const navigate = useNavigate();
  const { 
    addressData, 
    handleAddressChange, 
    handleCheckboxChange,
    useSameAddressForBilling,
    isAuthenticated,
    savedAddresses,
    fetchSavedAddresses,
    loadSavedAddress,
    isAddressValid,
    addressValidationMessage,
    goToNextStep,
    validateAddress,
    draftOrder
  } = useCheckout();
  
  // const { user } = useAuth();

  // Fetch saved addresses if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedAddresses();
    }
  }, [isAuthenticated, fetchSavedAddresses]);

  // Load address data from draft order if available
  useEffect(() => {
    if (draftOrder) {
      const address = type === 'shipping' ? draftOrder.shippingAddress : draftOrder.billingAddress;
      if (address) {
        // Update form fields with draft order address
        Object.entries(address).forEach(([key, value]) => {
          const event = {
            target: {
              name: key,
              value: value
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleAddressChange(event);
        });
      }
    }
  }, [draftOrder, type]);

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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
      </h3>

      {/* Saved addresses for authenticated users */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Select a saved address
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            onChange={handleAddressSelection}
          >
            <option value="">Select an address</option>
            {savedAddresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.address}, {address.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error message */}
      {!isAddressValid && addressValidationMessage && (
        <div className="mt-2 text-sm text-red-600">
          {addressValidationMessage}
        </div>
      )}

      {/* Address form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={addressData.firstName}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={addressData.lastName}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={addressData.email}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={addressData.phone}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={addressData.address}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address2" className="block text-sm font-medium text-gray-700">
            Apartment, suite, etc. (optional)
          </label>
          <input
            type="text"
            name="address2"
            id="address2"
            value={addressData.address2}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={addressData.city}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <input
            type="text"
            name="state"
            id="state"
            value={addressData.state}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            id="postalCode"
            value={addressData.postalCode}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            name="country"
            id="country"
            value={addressData.country}
            onChange={handleAddressChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
          >
            <option value="">Select a country</option>
            <option value="Rwanda">Rwanda</option>
            {/* Add more countries as needed */}
          </select>
        </div>
      </div>

      {/* Save address checkbox for authenticated users */}
      {isAuthenticated && (
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="useSameAddressForBilling"
              checked={useSameAddressForBilling}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Use the same address for billing
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