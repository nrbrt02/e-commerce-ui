// components/account/OrderDetailsModal.tsx
import React from 'react';

interface Address {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  email: string;
  phone: string;
  saveAddress: boolean;
}

interface PaymentDetails {
  amount: string;
  status: string;
  payerId: string;
  currency: string;
  payerEmail: string;
  paymentType: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentProvider: string;
  createTime: string;
  updateTime: string;
  storedAt: string;
}

interface OrderItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  metadata: any;
}

interface OrderMetadata {
  isDraft: boolean;
  shipping: number;
  convertedAt: string;
  totalAmount: string;
  draftSavedAt: string;
  paymentStatus: string;
  paymentDetails: PaymentDetails;
  draftOrderNumber: string;
  convertedFromDraft: boolean;
  draftLastUpdatedAt: string;
}

interface Order {
  id: number;
  customerId: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  totalItems: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
  shippingMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes: string | null;
  metadata: OrderMetadata;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  formatCurrency: (amount: number) => string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  formatCurrency 
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Order #{order.orderNumber}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span>{order.totalItems}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Shipping Method:</span>
                  <span className="capitalize">{order.shippingMethod.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{order.paymentDetails.transactionId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>{formatCurrency(parseFloat(order.paymentDetails.amount))}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span>{order.paymentDetails.currency}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Payer Email:</span>
                  <span>{order.paymentDetails.payerEmail}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Shipping Address</h3>
              <address className="not-italic text-gray-600">
                <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.address}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.country} {order.shippingAddress.postalCode}</p>
                <p className="mt-2">Email: {order.shippingAddress.email}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </address>
            </div>

            {/* Billing Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Billing Address</h3>
              <address className="not-italic text-gray-600">
                <p className="font-medium">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                <p>{order.billingAddress.address}</p>
                {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                <p>{order.billingAddress.city}, {order.billingAddress.state}</p>
                <p>{order.billingAddress.country} {order.billingAddress.postalCode}</p>
                <p className="mt-2">Email: {order.billingAddress.email}</p>
                <p>Phone: {order.billingAddress.phone}</p>
              </address>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="border-b last:border-b-0 p-4 flex items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>Quantity: {item.quantity}</p>
                      <p>Unit Price: {formatCurrency(parseFloat(item.unitPrice))}</p>
                      <p>Tax: {formatCurrency(parseFloat(item.tax))}</p>
                      {parseFloat(item.discount) > 0 && (
                        <p className="text-red-600">Discount: {formatCurrency(parseFloat(item.discount))}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(parseFloat(item.total))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="mt-6 border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(parseFloat(order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toString()))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{formatCurrency(order.metadata.shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>{formatCurrency(order.items.reduce((sum, item) => sum + parseFloat(item.tax), 0))}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(parseFloat(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {order.notes && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;