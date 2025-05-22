import React, { useEffect, useState } from 'react';
import { Order, OrderItem } from '../../types/order';
import { formatCurrency, formatDate } from '../../utils/formatters';
import orderApi from '../../utils/orderApi';

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const ViewOrderModal: React.FC<ViewOrderModalProps> = ({ isOpen, onClose, order }) => {
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'addresses' | 'tracking'>('details');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const orderDetails = await orderApi.getOrderById(order.id);
        setFullOrder(orderDetails);
      } catch (error) {
        console.error('Error fetching order details:', error);
        // Use the passed order as fallback
        setFullOrder(order);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [isOpen, order.id]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatAmount = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatCurrency(num);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start">
      <div className="relative bg-white rounded-lg shadow-xl m-4 max-w-2xl w-full md:max-w-4xl">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Order Details: {order.orderNumber}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2 border-b border-gray-200">
          <nav className="flex -mb-px space-x-5">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'addresses'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Addresses
            </button>
            {fullOrder?.status !== 'draft' && fullOrder?.status !== 'pending' && (
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'tracking'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tracking
              </button>
            )}
          </nav>
        </div>

        {/* Modal content */}
        <div className="p-6 max-h-[calc(80vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <>
              {!fullOrder ? (
                <p className="text-center text-gray-500">Could not load order details.</p>
              ) : (
                <>
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order Summary Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
                          <dl className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Order Date:</dt>
                              <dd>{formatDate(fullOrder.createdAt)}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Last Updated:</dt>
                              <dd>{formatDate(fullOrder.updatedAt)}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Total Items:</dt>
                              <dd>{fullOrder.totalItems}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Total Amount:</dt>
                              <dd className="font-medium">{formatAmount(fullOrder.totalAmount)}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Shipping Method:</dt>
                              <dd className="capitalize">{fullOrder.shippingMethod?.replace('_', ' ') || 'Not specified'}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Payment Information Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">Payment Information</h4>
                          <dl className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Payment Method:</dt>
                              <dd className="capitalize">{fullOrder.paymentMethod}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Transaction ID:</dt>
                              <dd className="font-mono text-xs">{fullOrder.paymentDetails.transactionId}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Amount:</dt>
                              <dd>{formatAmount(fullOrder.paymentDetails.amount)}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Currency:</dt>
                              <dd>{fullOrder.paymentDetails.currency}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Payer Email:</dt>
                              <dd>{fullOrder.paymentDetails.payerEmail}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                        <dl className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Name:</dt>
                            <dd>{fullOrder.customer.firstName} {fullOrder.customer.lastName}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Email:</dt>
                            <dd>{fullOrder.customer.email}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500">Phone:</dt>
                            <dd>{fullOrder.customer.phone || 'Not provided'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Additional Notes */}
                      {fullOrder.notes && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">Order Notes</h4>
                          <p className="text-sm text-gray-600">{fullOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'items' && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
                      {!fullOrder.items || fullOrder.items.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No items found for this order.</p>
                      ) : (
                        <div className="space-y-4">
                          {fullOrder.items.map((item: OrderItem) => (
                            <div key={item.id} className="border rounded-lg overflow-hidden">
                              <div className="p-4 flex items-start">
                                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md mr-4 flex items-center justify-center">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                  <div className="mt-1 flex justify-between text-sm">
                                    <p>{item.quantity} × {formatAmount(item.unitPrice)}</p>
                                    <p className="font-medium">{formatAmount(item.total)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                                <div>
                                  <span>Subtotal: {formatAmount(item.subtotal)}</span>
                                  {parseFloat(item.discount) > 0 && (
                                    <span className="ml-2">Discount: -{formatAmount(item.discount)}</span>
                                  )}
                                  {parseFloat(item.tax) > 0 && (
                                    <span className="ml-2">Tax: +{formatAmount(item.tax)}</span>
                                  )}
                                </div>
                                <div className="font-medium">
                                  Total: {formatAmount(item.total)}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Order Summary */}
                          <div className="mt-4 border-t pt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>{formatAmount(
                                fullOrder.items.reduce((sum: number, item: OrderItem) => 
                                  sum + parseFloat(item.subtotal), 0
                                )
                              )}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Discounts:</span>
                              <span>-{formatAmount(
                                fullOrder.items.reduce((sum: number, item: OrderItem) => 
                                  sum + parseFloat(item.discount), 0
                                )
                              )}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Tax:</span>
                              <span>{formatAmount(
                                fullOrder.items.reduce((sum: number, item: OrderItem) => 
                                  sum + parseFloat(item.tax), 0
                                )
                              )}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Shipping:</span>
                              <span>{formatAmount(fullOrder.metadata.shipping)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                              <span>Total:</span>
                              <span>{formatAmount(fullOrder.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'addresses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
                        <address className="not-italic text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{fullOrder.shippingAddress.firstName} {fullOrder.shippingAddress.lastName}</p>
                          <p>{fullOrder.shippingAddress.address}</p>
                          {fullOrder.shippingAddress.address2 && (
                            <p>{fullOrder.shippingAddress.address2}</p>
                          )}
                          <p>{fullOrder.shippingAddress.city}, {fullOrder.shippingAddress.state}</p>
                          <p>{fullOrder.shippingAddress.country} {fullOrder.shippingAddress.postalCode}</p>
                          <p className="mt-2">Email: {fullOrder.shippingAddress.email}</p>
                          <p>Phone: {fullOrder.shippingAddress.phone}</p>
                        </address>
                      </div>

                      {/* Billing Address */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Billing Address</h4>
                        <address className="not-italic text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{fullOrder.billingAddress.firstName} {fullOrder.billingAddress.lastName}</p>
                          <p>{fullOrder.billingAddress.address}</p>
                          {fullOrder.billingAddress.address2 && (
                            <p>{fullOrder.billingAddress.address2}</p>
                          )}
                          <p>{fullOrder.billingAddress.city}, {fullOrder.billingAddress.state}</p>
                          <p>{fullOrder.billingAddress.country} {fullOrder.billingAddress.postalCode}</p>
                          <p className="mt-2">Email: {fullOrder.billingAddress.email}</p>
                          <p>Phone: {fullOrder.billingAddress.phone}</p>
                        </address>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tracking' && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Tracking Information</h4>
                      {fullOrder.status === 'pending' || fullOrder.status === 'draft' ? (
                        <p className="text-center text-gray-500 py-4">
                          Tracking information will be available once the order is shipped.
                        </p>
                      ) : (
                        <div className="space-y-6">
                          {/* Tracking timeline */}
                          <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
                            <ul className="relative z-10 space-y-4">
                              {fullOrder.status === 'shipped' || fullOrder.status === 'delivered' || fullOrder.status === 'completed' ? (
                                <>
                                  <li className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 pt-1">
                                      <p className="font-medium text-gray-900">Order Shipped</p>
                                      <p className="text-sm text-gray-500">{formatDate(fullOrder.updatedAt)}</p>
                                      <p className="text-sm text-gray-600 mt-1">Your order has been shipped.</p>
                                    </div>
                                  </li>
                                  
                                  {(fullOrder.status === 'delivered' || fullOrder.status === 'completed') && (
                                    <li className="flex items-start">
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                      <div className="flex-1 pt-1">
                                        <p className="font-medium text-gray-900">Order Delivered</p>
                                        <p className="text-sm text-gray-500">{formatDate(fullOrder.updatedAt)}</p>
                                        <p className="text-sm text-gray-600 mt-1">Your order has been delivered successfully.</p>
                                      </div>
                                    </li>
                                  )}
                                </>
                              ) : (
                                <li className="flex items-start">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 pt-1">
                                    <p className="font-medium text-gray-900">Processing</p>
                                    <p className="text-sm text-gray-500">{formatDate(fullOrder.updatedAt)}</p>
                                    <p className="text-sm text-gray-600 mt-1">Your order is being processed.</p>
                                  </div>
                                </li>
                              )}
                              
                              <li className="flex items-start">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="font-medium text-gray-900">Order Placed</p>
                                  <p className="text-sm text-gray-500">{formatDate(fullOrder.createdAt)}</p>
                                  <p className="text-sm text-gray-600 mt-1">Your order has been placed successfully.</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;