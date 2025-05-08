// AddressForm.tsx
import React, { useState } from 'react';
import Button  from '../../components/ui/Button';

export interface Address {
  id: number;
  label: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// East African Countries List
const countriesList = [
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
  { code: 'UG', name: 'Uganda' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' }
];

interface AddressFormProps {
  initialData?: Address;
  onSubmit: (data: Partial<Address>) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  showDefaultOption?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
  showDefaultOption = false
}) => {
  const [formData, setFormData] = useState<Partial<Address>>({
    label: initialData?.label || 'Home',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'RW',
    phone: initialData?.phone || '',
    isDefault: initialData?.isDefault || false
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.label?.trim()) errors.label = 'Label is required';
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!formData.addressLine1?.trim()) errors.addressLine1 = 'Address line 1 is required';
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.state?.trim()) errors.state = 'State/Province is required';
    if (!formData.postalCode?.trim()) errors.postalCode = 'Postal code is required';
    if (!formData.country?.trim()) errors.country = 'Country is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Label */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Address Label
          </label>
          <select
            id="label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.label ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
          {formErrors.label && (
            <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
          )}
        </div>
        
        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.firstName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.lastName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
            )}
          </div>
        </div>
        
        {/* Address Line 1 */}
        <div>
          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.addressLine1 && (
            <p className="mt-1 text-sm text-red-600">{formErrors.addressLine1}</p>
          )}
        </div>
        
        {/* Address Line 2 */}
        <div>
          <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.city && (
              <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.state && (
              <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
            )}
          </div>
        </div>
        
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              formErrors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a country</option>
            {countriesList.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {formErrors.country && (
            <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
          )}
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="+250 781234567"
          />
        </div>
        
        {/* Default Option */}
        {showDefaultOption && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  isDefault: e.target.checked
                });
              }}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
              Set as default address
            </label>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Address' : 'Add Address'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddressForm;