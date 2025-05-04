import React from 'react';
import { useCheckout } from '../../context/CheckoutContenxt';

const DeliveryOptions: React.FC = () => {
  const { 
    deliveryOptions, 
    selectedShippingMethod, 
    setSelectedShippingMethod,
    isLoadingShippingOptions,
    addressData
  } = useCheckout();

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle shipping method selection
  const handleShippingMethodSelection = (id: string) => {
    setSelectedShippingMethod(id);
  };

  // Show loading spinner
  if (isLoadingShippingOptions) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Options</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          <span className="ml-3 text-gray-600">Loading delivery options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Options</h2>
      
      {/* Address summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          <i className="fas fa-map-marker-alt mr-2"></i>
          Shipping to:
        </h3>
        <div className="text-sm text-gray-600">
          <p>{addressData.firstName} {addressData.lastName}</p>
          <p>{addressData.address}</p>
          {addressData.address2 && <p>{addressData.address2}</p>}
          <p>{addressData.city}, {addressData.state} {addressData.postalCode}</p>
          <p>{addressData.country}</p>
        </div>
      </div>
      
      {/* Available delivery options */}
      <div className="space-y-4">
        {deliveryOptions.map((option) => (
          <div 
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedShippingMethod === option.id
                ? 'border-sky-400 bg-sky-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => option.available && handleShippingMethodSelection(option.id)}
          >
            <div className="flex items-start">
              {/* Radio button */}
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`h-5 w-5 border rounded-full flex items-center justify-center ${
                    selectedShippingMethod === option.id
                      ? 'border-sky-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedShippingMethod === option.id && (
                    <div className="h-3 w-3 rounded-full bg-sky-600"></div>
                  )}
                </div>
              </div>
              
              {/* Option details */}
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <h3 className="text-gray-800 font-medium">{option.name}</h3>
                  <span className="text-gray-800 font-medium">
                    {option.price === 0 ? 'Free' : formatCurrency(option.price)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{option.description}</p>
                
                {/* Estimated delivery date */}
                {option.estimatedDelivery && (
                  <p className="text-gray-600 text-sm mt-1">
                    <i className="far fa-calendar-alt mr-1"></i>
                    Estimated delivery: {option.estimatedDelivery}
                  </p>
                )}
                
                {/* Not available message */}
                {!option.available && (
                  <p className="text-red-500 text-sm mt-1">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    Not available for your location
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* No available options */}
        {deliveryOptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-truck-loading text-4xl mb-3"></i>
            <p>No delivery options available for your location.</p>
            <p className="text-sm mt-2">
              Please try a different address or contact our support team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOptions;