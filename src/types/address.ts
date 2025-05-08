export interface BaseAddress {
    id?: number;
    customerId?: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    isDefault?: boolean;
    type?: 'shipping' | 'billing' | 'both';
  }
  
  export interface Address extends BaseAddress {
    addressLine1: string;
    addressLine2?: string;
    postalCode?: string;
    zipCode?: string;
  }
  
  export interface AddressFormData extends BaseAddress {
    address: string;  // Maps to addressLine1
    address2?: string; // Maps to addressLine2
    postalCode: string;
    saveAddress: boolean;
    email: string; // Required in form but optional in base
  }