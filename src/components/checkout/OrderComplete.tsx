import React from 'react';
import { Link } from 'react-router-dom';
import { useCheckout } from '../../context/CheckoutContenxt';
import { formatCurrency } from '../../utils/currencyUtils';

const OrderComplete: React.FC = () => {
  const { orderDetails } = useCheckout();

  if (!orderDetails) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-4">Order Processing</h2>
        <p>Please wait while we process your order...</p>
      </div>
    );
  }

  const { order } = orderDetails;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Order Placed Successfully!</h2>
          <p className="text-gray-600 mt-2">Thank you for your purchase</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
                <p><span className="font-medium">Status:</span> <span className="capitalize">{order.status}</span></p>
                <p><span className="font-medium">Payment Status:</span> <span className="capitalize">{order.paymentStatus}</span></p>
                <p><span className="font-medium">Payment Method:</span> <span className="capitalize">{order.paymentMethod}</span></p>
                <p><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <div className="space-y-2">
                {order.paymentMethod === 'paypal' && order.paymentDetails && (
                  <>
                    <p><span className="font-medium">Transaction ID:</span> {order.paymentDetails.transactionId || 'N/A'}</p>
                    <p><span className="font-medium">Payer ID:</span> {order.paymentDetails.payerId || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {order.paymentDetails.payerEmail || 'N/A'}</p>
                    <p><span className="font-medium">Amount:</span> {order.paymentDetails.amount} {order.paymentDetails.currency}</p>
                    <p><span className="font-medium">Status:</span> {order.paymentDetails.status}</p>
                    <p><span className="font-medium">Payment Date:</span> {order.paymentDetails.createTime ? new Date(order.paymentDetails.createTime).toLocaleString() : 'N/A'}</p>
                  </>
                )}
                {order.paymentMethod === 'card' && order.paymentDetails && (
                  <>
                    <p><span className="font-medium">Card Type:</span> {order.paymentDetails.cardType}</p>
                    <p><span className="font-medium">Last Four:</span> {order.paymentDetails.lastFour}</p>
                    <p><span className="font-medium">Expiry Date:</span> {order.paymentDetails.expiryDate}</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Method:</span> <span className="capitalize">{order.shippingMethod}</span></p>
                <p><span className="font-medium">Address:</span></p>
                <div className="pl-4 space-y-1">
                  <p className="text-gray-600">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  {order.shippingAddress.address2 && <p className="text-gray-600">{order.shippingAddress.address2}</p>}
                  <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                  <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                  <p className="text-gray-600">Email: {order.shippingAddress.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.total)}</p>
                  <p className="text-sm text-gray-600">Unit Price: {formatCurrency(item.unitPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-semibold">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/accounts"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Order History
        </Link>
      </div>
    </div>
  );
};

export default OrderComplete;