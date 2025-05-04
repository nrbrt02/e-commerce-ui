import { apiClient, createApiService } from './apiClient';

// Define the types in this file to avoid circular dependencies
export interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  saveAddress: boolean;
}

export interface Address {
  id?: number;
  customerId?: number;
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

// Define backend address format to handle transformations
export interface BackendAddress {
  id?: number;
  customerId?: number;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  type?: 'shipping' | 'billing' | 'both';
}

// Create the address API service
const addressApiService = createApiService<Address>('/addresses');

// Extended address service with custom methods
export const addressApi = {
  ...addressApiService,

  // Get all addresses for current user
  getMyAddresses: async (): Promise<Address[]> => {
    try {
      // Add caching mechanism
      const cachedAddresses = localStorage.getItem('cachedAddresses');
      if (cachedAddresses) {
        return JSON.parse(cachedAddresses);
      }

      const response = await apiClient.get('/addresses');
      
      // Check if there is response data and it's properly structured
      if (!response.data) {
        console.warn("Unexpected API response format:", response);
        return [];
      }
      
      let addresses: (Address | BackendAddress)[] = [];
      
      // Handle different API response formats
      if (Array.isArray(response.data)) {
        addresses = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        addresses = response.data.data;
      } else if (response.data.addresses && Array.isArray(response.data.addresses)) {
        addresses = response.data.addresses;
      } else {
        console.warn("Unexpected API response structure:", response.data);
        // Try a mock response for development
        return [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            address: "123 Main St",
            city: "Kigali",
            state: "Kigali",
            postalCode: "00000",
            country: "Rwanda",
            phone: "0781234567",
            isDefault: true,
            type: "both"
          }
        ];
      }
      
      // Transform addresses if they're in backend format
      const transformedAddresses = addresses.map((address: Address | BackendAddress) => {
        if ('addressLine1' in address) {
          return addressApi.transformBackendToFrontend(address as BackendAddress);
        }
        return address as Address;
      });
      
      // Cache the addresses
      localStorage.setItem('cachedAddresses', JSON.stringify(transformedAddresses));
      return transformedAddresses;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Return cached addresses if available
      const cachedAddresses = localStorage.getItem('cachedAddresses');
      if (cachedAddresses) {
        return JSON.parse(cachedAddresses);
      }
      return [];
    }
  },

  saveAddress: async (addressData: Address): Promise<Address> => {
    try {
      // Clear cached addresses when saving a new one
      localStorage.removeItem('cachedAddresses');

      // Check if we need to transform to backend format
      const apiAddress = 'address' in addressData ? 
        addressApi.transformFrontendToBackend(addressData) : 
        addressData;
        
      const response = await apiClient.post('/addresses', apiAddress);
      
      // Handle different API response formats
      let savedAddress: Address | BackendAddress;
      if (response.data.data) {
        savedAddress = response.data.data;
      } else if (response.data.address) {
        savedAddress = response.data.address;
      } else {
        savedAddress = response.data;
      }
      
      // Transform from backend format if needed
      if (savedAddress && 'addressLine1' in savedAddress) {
        return addressApi.transformBackendToFrontend(savedAddress as BackendAddress);
      }
      
      return savedAddress as Address;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  },

  // Update an existing address
  updateAddress: async (id: number, addressData: Partial<Address>): Promise<Address> => {
    try {
      // Clear cached addresses when updating
      localStorage.removeItem('cachedAddresses');

      // Check if we need to transform to backend format
      const apiAddress = 'address' in addressData ? 
        addressApi.transformFrontendToBackend(addressData as Address) : 
        addressData;
        
      const response = await apiClient.put(`/addresses/${id}`, apiAddress);
      
      // Handle different API response formats
      let updatedAddress: Address | BackendAddress;
      if (response.data.data) {
        updatedAddress = response.data.data;
      } else if (response.data.address) {
        updatedAddress = response.data.address;
      } else {
        updatedAddress = response.data;
      }
      
      // Transform from backend format if needed
      if (updatedAddress && 'addressLine1' in updatedAddress) {
        return addressApi.transformBackendToFrontend(updatedAddress as BackendAddress);
      }
      
      return updatedAddress as Address;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  // Delete an address
  deleteAddress: async (id: number): Promise<void> => {
    try {
      // Clear cached addresses when deleting
      localStorage.removeItem('cachedAddresses');
      await apiClient.delete(`/addresses/${id}`);
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  // Set an address as default
  setDefaultAddress: async (id: number): Promise<Address> => {
    try {
      // Clear cached addresses when setting default
      localStorage.removeItem('cachedAddresses');

      const response = await apiClient.patch(`/addresses/${id}/set-default`);
      
      // Handle different API response formats
      let updatedAddress: Address | BackendAddress;
      if (response.data.data) {
        updatedAddress = response.data.data;
      } else if (response.data.address) {
        updatedAddress = response.data.address;
      } else {
        updatedAddress = response.data;
      }
      
      // Transform from backend format if needed
      if (updatedAddress && 'addressLine1' in updatedAddress) {
        return addressApi.transformBackendToFrontend(updatedAddress as BackendAddress);
      }
      
      return updatedAddress as Address;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  },

  // Transform form address data to API address format
  transformFormToApiAddress: (formData: AddressFormData): Address => {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      type: 'both',
      isDefault: false
    };
  },

  // Transform API address to form data format
  transformApiToFormAddress: (apiAddress: Address): AddressFormData => {
    return {
      firstName: apiAddress.firstName,
      lastName: apiAddress.lastName,
      email: '', // API address doesn't store email, need to be filled separately
      phone: apiAddress.phone || '',
      address: apiAddress.address,
      address2: apiAddress.address2 || '',
      city: apiAddress.city,
      state: apiAddress.state,
      postalCode: apiAddress.postalCode || '',
      country: apiAddress.country,
      saveAddress: false // This is a form-only field
    };
  },

  // Transform backend address format to frontend format
  transformBackendToFrontend: (backendAddress: BackendAddress): Address => {
    return {
      id: backendAddress.id,
      customerId: backendAddress.customerId,
      firstName: backendAddress.firstName,
      lastName: backendAddress.lastName,
      address: backendAddress.addressLine1,
      address2: backendAddress.addressLine2,
      city: backendAddress.city,
      state: backendAddress.state,
      postalCode: backendAddress.postalCode,
      country: backendAddress.country,
      phone: backendAddress.phone || '',
      isDefault: backendAddress.isDefault,
      type: backendAddress.type
    };
  },

  // Transform frontend address format to backend format
  transformFrontendToBackend: (address: Address): BackendAddress => {
    return {
      id: address.id,
      customerId: address.customerId,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.address,
      addressLine2: address.address2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
      type: address.type
    };
  }
};

export default addressApi;