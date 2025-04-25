// src/components/account/AddressManagement.tsx
import React, { useState, useEffect } from 'react';
import { customerApi } from "../../utils";
import { showToast } from '../../components/ui/ToastProvider';
import { FiPlus, FiEdit, FiTrash2, FiMapPin, FiCheck, FiLoader } from 'react-icons/fi';

interface Address {
  id?: string | number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

const AddressManagement: React.FC<{ profile: any }> = ({ profile }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  
  // Form data for adding/editing address
  const [formData, setFormData] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false,
    type: 'shipping'
  });
  
  // Load addresses from profile - use memo to prevent unnecessary re-renders
  useEffect(() => {
    if (profile?.addresses && Array.isArray(profile.addresses)) {
      setAddresses(profile.addresses);
    } else {
      setAddresses([]);
    }
  }, [profile?.addresses]); // Only re-run when profile.addresses changes

  // Reset form data
  const resetForm = React.useCallback(() => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
      type: 'shipping'
    });
    setEditingAddressIndex(null);
  }, []);

  // Handle form input changes
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError(null);
  }, []);

  // Handle form submission for adding/editing address
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAddresses = [...addresses];
      
      if (editingAddressIndex !== null && editingAddressIndex >= 0) {
        updatedAddresses[editingAddressIndex] = { ...formData };
        
        if (formData.isDefault) {
          updatedAddresses.forEach((addr, idx) => {
            if (idx !== editingAddressIndex) addr.isDefault = false;
          });
        }
      } else {
        if (formData.isDefault || updatedAddresses.length === 0) {
          updatedAddresses.forEach(addr => { addr.isDefault = false; });
          updatedAddresses.push({ ...formData, isDefault: true });
        } else {
          updatedAddresses.push({ ...formData });
        }
      }
      
      await customerApi.updateProfile({ addresses: updatedAddresses });
      
      setAddresses(updatedAddresses);
      setShowAddForm(false);
      resetForm();
      
      showToast.success(
        editingAddressIndex !== null 
          ? 'Address updated successfully!' 
          : 'Address added successfully!'
      );
    } catch (err: any) {
      console.error('Error saving address:', err);
      const errorMsg = err.response?.data?.message || 'Failed to save address. Please try again.';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set address as default
  const handleSetDefault = async (index: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAddresses = [...addresses];
      updatedAddresses.forEach((addr, idx) => {
        addr.isDefault = idx === index;
      });
      
      await customerApi.updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      showToast.success('Default address updated');
    } catch (err: any) {
      console.error('Error updating default address:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update default address';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Edit address
  const handleEdit = (index: number) => {
    setFormData({ ...addresses[index] });
    setEditingAddressIndex(index);
    setShowAddForm(true);
    setError(null);
  };
  
  // Delete address
  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAddresses = [...addresses];
      updatedAddresses.splice(index, 1);
      
      if (addresses[index].isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }
      
      await customerApi.updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      showToast.success('Address deleted successfully');
    } catch (err: any) {
      console.error('Error deleting address:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete address';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Address form component - memoized to prevent unnecessary re-renders
  const AddressForm = React.useMemo(() => () => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        {editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
              placeholder="Street address, P.O. box, company name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2 || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State / Province / Region
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code / ZIP
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            >
              <option value="">Select a country</option>
              <option value="US" selected>Rwanda</option>
              <option value="CA">Burundi</option>
              <option value="MX">Uganda</option>
              <option value="GB">Tanzania Kingdom</option>
              <option value="FR">Kenya</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
              <option value="both">Shipping & Billing</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false);
              resetForm();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <FiLoader className="animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              editingAddressIndex !== null ? 'Update Address' : 'Add Address'
            )}
          </button>
        </div>
      </form>
    </div>
  ), [formData, editingAddressIndex, handleChange, handleSubmit, isLoading, resetForm]);

  // Address card component - memoized to prevent unnecessary re-renders
  const AddressCard = React.useCallback(({ address, index }: { address: Address; index: number }) => (
    <div className={`p-4 border rounded-lg mb-4 ${address.isDefault ? 'border-sky-500 bg-sky-50' : 'border-gray-200'}`}>
      {address.isDefault && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
            Default Address
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <h4 className="text-lg font-medium">{address.fullName}</h4>
        <p className="text-gray-700">{address.phone}</p>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700">{address.addressLine1}</p>
        {address.addressLine2 && <p className="text-gray-700">{address.addressLine2}</p>}
        <p className="text-gray-700">
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="text-gray-700">{address.country}</p>
      </div>
      
      <div className="mt-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {address.type === 'shipping' ? 'Shipping' : 
           address.type === 'billing' ? 'Billing' : 
           'Shipping & Billing'}
        </span>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => handleEdit(index)}
          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          <FiEdit className="mr-1" /> Edit
        </button>
        
        {!address.isDefault && (
          <button
            onClick={() => handleSetDefault(index)}
            className="px-3 py-1.5 border border-sky-600 text-sky-600 rounded-md hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <FiCheck className="mr-1" /> Set as Default
          </button>
        )}
        
        <button
          onClick={() => handleDelete(index)}
          className="px-3 py-1.5 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FiTrash2 className="mr-1" /> Delete
        </button>
      </div>
    </div>
  ), [handleDelete, handleEdit, handleSetDefault]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-sky-50 border-b border-gray-200">
        <h2 className="font-medium text-sky-800">My Addresses</h2>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Address Form */}
        {showAddForm && AddressForm()}
        
        {/* Add Address Button */}
        {!showAddForm && (
          <button
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="mb-6 px-4 py-2 border border-sky-600 text-sky-600 rounded-md hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            <FiPlus className="mr-2" /> Add New Address
          </button>
        )}
        
        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address, index) => (
              <AddressCard key={index} address={address} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500">
              <FiMapPin className="text-3xl mb-3 mx-auto" />
              <p>You don't have any saved addresses yet.</p>
              {!showAddForm && (
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    resetForm();
                  }}
                  className="mt-3 inline-block text-sky-600 hover:underline"
                >
                  Add your first address
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AddressManagement);