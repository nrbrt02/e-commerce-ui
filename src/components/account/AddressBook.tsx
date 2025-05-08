import React, { useState, useEffect } from "react";
import { addressApi, Address, BackendAddress } from "../../utils/addressApi";

const AddressBook: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Address>({
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Rwanda",
    phone: "",
    isDefault: false,
    type: "both",
  });

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

const fetchAddresses = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const fetchedAddresses = await addressApi.getMyAddresses();
    
    // Ensure all addresses are in frontend format
    const transformedAddresses = fetchedAddresses.map(address => {
      // Type guard to check if it's a backend address
      if ('addressLine1' in address) {
        return addressApi.transformBackendToFrontend(address as BackendAddress);
      }
      return address as Address;
    });
    
    setAddresses(transformedAddresses);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    setError("Failed to load your saved addresses. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // Handle adding a new address
  const handleAddAddress = () => {
    setIsEditing(false);
    setCurrentAddress(null);
    setFormData({
      firstName: "",
      lastName: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Rwanda",
      phone: "",
      isDefault: false,
      type: "both",
    });
    setShowForm(true);
  };

  // Handle editing an existing address
  const handleEditAddress = (address: Address) => {
    setIsEditing(true);
    setCurrentAddress(address);
    setFormData(address);
    setShowForm(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const requiredFields = [
      'firstName', 'lastName', 'address', 'city', 'state', 'country', 'phone'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof Address]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Basic phone validation
    const phoneRegex = /^\d{7,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing && currentAddress?.id) {
        // Update existing address
        const apiAddress = { ...formData };
        await addressApi.updateAddress(currentAddress.id, apiAddress);
        
        // If set as default, update UI immediately
        if (formData.isDefault && !currentAddress.isDefault) {
          // Mark other addresses as non-default in UI
          setAddresses(prev => 
            prev.map(addr => addr.id === currentAddress.id 
              ? { ...addr, ...formData } 
              : { ...addr, isDefault: false }
            )
          );
        } else {
          // Just update this address in UI
          setAddresses(prev => 
            prev.map(addr => addr.id === currentAddress.id 
              ? { ...addr, ...formData } 
              : addr
            )
          );
        }
      } else {
        // Create new address
        const apiAddress = { ...formData };
        const newAddress = await addressApi.saveAddress(apiAddress);
        
        // Add new address to UI
        if (formData.isDefault) {
          // Mark other addresses as non-default
          setAddresses(prev => [
            ...prev.map(addr => ({ ...addr, isDefault: false })),
            newAddress
          ]);
        } else {
          setAddresses(prev => [...prev, newAddress]);
        }
      }
      
      // Reset form and state
      setShowForm(false);
      setCurrentAddress(null);
      setIsEditing(false);
      
      // Refresh the address list to ensure accurate data
      fetchAddresses();
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting address as default
  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (address.id) {
        await addressApi.setDefaultAddress(address.id);
        
        // Update UI
        setAddresses(prev => 
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === address.id
          }))
        );
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (address: Address) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (address.id) {
        await addressApi.deleteAddress(address.id);
        
        // Remove from UI
        setAddresses(prev => prev.filter(addr => addr.id !== address.id));
        
        // If we're currently editing this address, close the form
        if (currentAddress?.id === address.id) {
          setShowForm(false);
          setCurrentAddress(null);
        }
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Addresses</h2>
        <button
          onClick={handleAddAddress}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200"
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Address
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-600 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !showForm && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      )}

      {/* Address form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {isEditing ? "Edit Address" : "Add New Address"}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  value={formData.firstName}
                  onChange={handleInputChange}
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
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
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
                  value={formData.phone || ''}
                  onChange={handleInputChange}
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
                  value={formData.address}
                  onChange={handleInputChange}
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
                  value={formData.address2 || ''}
                  onChange={handleInputChange}
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
                  value={formData.city}
                  onChange={handleInputChange}
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
                  value={formData.state}
                  onChange={handleInputChange}
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
                  value={formData.postalCode || ''}
                  onChange={handleInputChange}
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
                  value={formData.country}
                  onChange={handleInputChange}
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
              
              <div className="md:col-span-2">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type || 'both'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                >
                  <option value="shipping">Shipping Only</option>
                  <option value="billing">Billing Only</option>
                  <option value="both">Shipping & Billing</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <span className="ml-2 text-gray-700">
                  Set as default address
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {isEditing ? "Update Address" : "Save Address"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {!isLoading && addresses.length === 0 && !showForm && (
        <div className="text-center p-8 text-gray-500">
          <i className="fas fa-home text-4xl mb-3"></i>
          <p>You don't have any saved addresses yet.</p>
          <button
            onClick={handleAddAddress}
            className="mt-4 text-sky-600 hover:text-sky-800"
          >
            Add your first address
          </button>
        </div>
      )}

      {!isLoading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 ${
                address.isDefault
                  ? "border-sky-300 bg-sky-50"
                  : "border-gray-200"
              }`}
            >
              {address.isDefault && (
                <div className="text-sky-600 text-sm font-medium mb-2 flex items-center">
                  <i className="fas fa-check-circle mr-1"></i>
                  Default Address
                </div>
              )}
              
              <div className="mb-3">
                <p className="font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-gray-600 text-sm">
                  {address.address}
                  {address.address2 && <span>, {address.address2}</span>}
                </p>
                <p className="text-gray-600 text-sm">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-gray-600 text-sm">{address.country}</p>
                <p className="text-gray-600 text-sm">{address.phone}</p>
                
                {address.type && address.type !== 'both' && (
                  <p className="text-gray-600 text-sm mt-1 italic">
                    {address.type === 'shipping' ? 'Shipping address only' : 'Billing address only'}
                  </p>
                )}
              </div>

              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="text-sm text-gray-600 hover:text-sky-600"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </button>
                
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address)}
                    className="text-sm text-gray-600 hover:text-sky-600"
                  >
                    <i className="fas fa-check-circle mr-1"></i>
                    Set as Default
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteAddress(address)}
                  className="text-sm text-gray-600 hover:text-red-600 ml-auto"
                >
                  <i className="fas fa-trash-alt mr-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;