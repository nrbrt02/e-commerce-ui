import React, { useState, useEffect } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon, StarIcon, HomeIcon, BriefcaseIcon, MapPinIcon } from 'lucide-react';
import useToast from '../../utils/toast';
import Button from '../../components/ui/Button';
import { useAuth } from "../../context/AuthContext";

// Define the Address type
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


// Mock API functions - replace these with your actual API calls
const userApi = {
  getUserAddresses: async (): Promise<Address[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        label: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        city: 'Kigali',
        state: 'Kigali',
        postalCode: '0000',
        country: 'RW',
        phone: '+250781234567',
        isDefault: true
      }
    ];
  },
  addAddress: async (data: Partial<Address>): Promise<Address> => {
    // Mock implementation - replace with actual API call
    return {
      id: Math.floor(Math.random() * 1000),
      label: data.label || 'Home',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2,
      city: data.city || '',
      state: data.state || '',
      postalCode: data.postalCode || '',
      country: data.country || 'RW',
      phone: data.phone,
      isDefault: data.isDefault || false
    };
  },
  updateAddress: async (id: number, data: Partial<Address>): Promise<Address> => {
    // Mock implementation - replace with actual API call
    return {
      id,
      label: data.label || 'Home',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2,
      city: data.city || '',
      state: data.state || '',
      postalCode: data.postalCode || '',
      country: data.country || 'RW',
      phone: data.phone,
      isDefault: data.isDefault || false
    };
  },
  deleteAddress: async (_id: number): Promise<void> => {
    // Mock implementation - replace with actual API call
    return;
  }
};

// Card components - since we're not importing them separately
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`border-b p-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-lg ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// AddressForm component
const AddressForm: React.FC<{
  initialData?: Address;
  onSubmit: (data: Partial<Address>) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  showDefaultOption?: boolean;
}> = ({ initialData, onSubmit, isSubmitting, onCancel, showDefaultOption = false }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  // East African Countries List
  const countriesList = [
    { code: 'RW', name: 'Rwanda' },
    { code: 'BI', name: 'Burundi' },
    { code: 'UG', name: 'Uganda' },
    { code: 'KE', name: 'Kenya' },
    { code: 'TZ', name: 'Tanzania' }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Label */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium mb-1">
            Address Label
          </label>
          <select
            id="label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${formErrors.label ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
          {formErrors.label && <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>}
        </div>
        
        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
          </div>
        </div>
        
        {/* Address Line 1 */}
        <div>
          <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
            Address Line 1
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${formErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
          />
          {formErrors.addressLine1 && <p className="mt-1 text-sm text-red-600">{formErrors.addressLine1}</p>}
        </div>
        
        {/* Address Line 2 */}
        <div>
          <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
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
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${formErrors.state ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${formErrors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.postalCode && <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>}
          </div>
        </div>
        
        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${formErrors.country ? 'border-red-500' : 'border-gray-300'}`}
          >
            {countriesList.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {formErrors.country && <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
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
              checked={formData.isDefault || false}
              onChange={handleChange}
              className="h-4 w-4 text-primary border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm">
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

// DeleteConfirmDialog component
const DeleteConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  description: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, description, isDeleting, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-700">{description}</p>
        </div>
        <div className="p-4 border-t flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddressManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await userApi.getUserAddresses();
      setAddresses(response);
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message || 'Failed to fetch addresses',
            variant: 'destructive'
          });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteClick = (addressId: number) => {
    setDeletingAddressId(addressId);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    setIsDeleting(true);
    try {
      await userApi.deleteAddress(deletingAddressId);
      setAddresses(addresses.filter(address => address.id !== deletingAddressId));
      toast({
        title: 'Address Deleted',
        description: 'The address has been successfully deleted',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete address',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeletingAddressId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingAddressId(null);
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await userApi.updateAddress(addressId, { isDefault: true });
      setAddresses(
        addresses.map(address => ({
          ...address,
          isDefault: address.id === addressId
        }))
      );
      toast({
        title: 'Default Address Updated',
        description: 'Your default address has been updated',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update default address',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitAddress = async (formData: Partial<Address>) => {
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        // Update existing address
        await userApi.updateAddress(editingAddress.id, formData);
        setAddresses(
          addresses.map(address => 
            address.id === editingAddress.id 
              ? { ...address, ...formData }
              : formData.isDefault ? { ...address, isDefault: false } : address
          )
        );
        toast({
          title: 'Address Updated',
          description: 'Your address has been successfully updated',
          variant: 'success',
        });
      } else {
        // Add new address
        const response = await userApi.addAddress(formData);
        if (formData.isDefault) {
          setAddresses([
            response,
            ...addresses.map(address => ({ ...address, isDefault: false }))
          ]);
        } else {
          setAddresses([response, ...addresses]);
        }
        toast({
          title: 'Address Added',
          description: 'Your new address has been successfully added',
          variant: 'success',
        });
      }
      setShowAddForm(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get address label icon
  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return <HomeIcon className="h-4 w-4" />;
      case 'work':
      case 'office':
        return <BriefcaseIcon className="h-4 w-4" />;
      default:
        return <MapPinIcon className="h-4 w-4" />;
    }
  };

  // Get country name from code
  const getCountryName = (countryCode: string) => {
    const countries = [
      { code: 'RW', name: 'Rwanda' },
      { code: 'BI', name: 'Burundi' },
      { code: 'UG', name: 'Uganda' },
      { code: 'KE', name: 'Kenya' },
      { code: 'TZ', name: 'Tanzania' }
    ];
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p>Please sign in to manage your addresses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>My Addresses</CardTitle>
          <Button onClick={handleAddAddress} size="small" className="h-8 px-2">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add New Address
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MapPinIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="mb-4">You haven't added any addresses yet</p>
              <Button onClick={handleAddAddress} variant="outline">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`relative p-4 rounded-lg border ${
                    address.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  {address.isDefault && (
                    <div className="absolute top-2 right-2 text-primary flex items-center">
                      <StarIcon className="h-4 w-4 fill-primary" />
                      <span className="text-xs ml-1">Default</span>
                    </div>
                  )}
                  
                  <div className="flex items-center mb-2">
                    <div className="rounded-full p-1 bg-muted mr-2">
                      {getAddressIcon(address.label)}
                    </div>
                    <h3 className="font-medium">{address.label}</h3>
                  </div>
                  
                  <div className="text-sm space-y-1 mb-4">
                    <p><span className="font-medium">{address.firstName} {address.lastName}</span></p>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.postalCode}</p>
                    <p>{getCountryName(address.country)}</p>
                    {address.phone && <p>{address.phone}</p>}
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="small" onClick={() => handleEditAddress(address)}>
                      <Edit2Icon className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <StarIcon className="h-3.5 w-3.5 mr-1" />
                        Set as Default
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      size="small"
                      onClick={() => handleDeleteClick(address.id)}
                      disabled={addresses.length <= 1}
                    >
                      <Trash2Icon className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Form Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-background p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <Button variant="ghost" size="small" onClick={handleCloseForm}>
                &times;
              </Button>
            </div>
            <div className="p-4">
              <AddressForm
                initialData={editingAddress || undefined}
                onSubmit={handleSubmitAddress}
                isSubmitting={isSubmitting}
                onCancel={handleCloseForm}
                showDefaultOption
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deletingAddressId !== null}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default AddressManagement;