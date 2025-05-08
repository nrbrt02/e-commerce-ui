// components/account/OrderDetailsModal.tsx
import React from 'react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  formatCurrency: (amount: number) => string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  formatCurrency 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Order #{order.orderNumber}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{order.status}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{order.paymentMethod || 'Not specified'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Shipping Method:</span>
                  <span>{order.shippingMethod || 'Not specified'}</span>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Shipping Address</h3>
                <address className="not-italic text-gray-600">
                  {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                  {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
                  {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
                </address>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="border-b last:border-b-0 p-4 flex">
                  {item.image && (
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    {item.options && (
                      <div className="mt-1">
                        {Object.entries(item.options).map(([key, value]) => (
                          <p key={key} className="text-xs text-gray-500">
                            {key}: {String(value)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;