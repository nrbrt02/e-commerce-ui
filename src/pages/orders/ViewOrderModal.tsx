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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-start">
      <div className="relative bg-white rounded-lg shadow-xl m-4 max-w-2xl w-full md:max-w-4xl">
        {/* Modal header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Order Details: {order.orderNumber}
          </h3>
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
                              <dt className="text-gray-500">Status:</dt>
                              <dd className="font-medium">{fullOrder.status.charAt(0).toUpperCase() + fullOrder.status.slice(1)}</dd>
                            </div>
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
                              <dd className="font-medium">{formatCurrency(fullOrder.totalAmount)}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Payment Information Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">Payment Information</h4>
                          <dl className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Payment Status:</dt>
                              <dd className="font-medium">{fullOrder.paymentStatus.charAt(0).toUpperCase() + fullOrder.paymentStatus.slice(1)}</dd>
                            </div>
                            <div className="flex justify-between text-sm">
                              <dt className="text-gray-500">Payment Method:</dt>
                              <dd>{fullOrder.paymentMethod || 'Not specified'}</dd>
                            </div>
                            {fullOrder.paymentMethod === 'credit_card' && fullOrder.paymentDetails && (
                              <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Card:</dt>
                                <dd>•••• •••• •••• {(fullOrder.paymentDetails as any).last4 || '1234'}</dd>
                              </div>
                            )}
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
                                {item.product?.imageUrl ? (
                                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                                    <img 
                                      src={item.product.imageUrl} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md mr-4 flex items-center justify-center">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                  <div className="mt-1 flex justify-between text-sm">
                                    <p>{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                                    <p className="font-medium">{formatCurrency(item.total)}</p>
                                  </div>
                                </div>
                              </div>
                              {(item.discount > 0 || item.tax > 0) && (
                                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                                  <div>
                                    <span>Subtotal: {formatCurrency(item.subtotal)}</span>
                                    {item.discount > 0 && (
                                      <span className="ml-2">Discount: -{formatCurrency(item.discount)}</span>
                                    )}
                                    {item.tax > 0 && (
                                      <span className="ml-2">Tax: +{formatCurrency(item.tax)}</span>
                                    )}
                                  </div>
                                  <div className="font-medium">
                                    Total: {formatCurrency(item.total)}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Order Summary */}
                          <div className="mt-4 border-t pt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>{formatCurrency(
                                fullOrder.items.reduce((sum: number, item: OrderItem) => sum + item.subtotal, 0)
                              )}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Discounts:</span>
                              <span>-{formatCurrency(
                                fullOrder.items.reduce((sum: number, item: OrderItem) => sum + item.discount, 0)
                              )}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Tax:</span>
                              <span>{formatCurrency(
                                fullOrder.items.reduce((sum: number, item: OrderItem) => sum + item.tax, 0)
                              )}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Shipping:</span>
                              <span>{formatCurrency(
                                fullOrder.totalAmount - fullOrder.items.reduce(
                                  (sum: number, item: OrderItem) => sum + item.total, 0
                                )
                              )}</span>
                            </div>
                            <div className="flex justify-between font-medium text-base mt-2 pt-2 border-t">
                              <span>Total:</span>
                              <span>{formatCurrency(fullOrder.totalAmount)}</span>
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
                        {!fullOrder.shippingAddress ? (
                          <p className="text-sm text-gray-500">No shipping address provided.</p>
                        ) : (
                          <address className="not-italic text-sm text-gray-600 space-y-1">
                            <p>{fullOrder.shippingAddress.firstName} {fullOrder.shippingAddress.lastName}</p>
                            <p>{fullOrder.shippingAddress.addressLine1}</p>
                            {fullOrder.shippingAddress.addressLine2 && (
                              <p>{fullOrder.shippingAddress.addressLine2}</p>
                            )}
                            <p>
                              {fullOrder.shippingAddress.city}, {fullOrder.shippingAddress.state} {' '}
                              {fullOrder.shippingAddress.zipCode || fullOrder.shippingAddress.postalCode}
                            </p>
                            <p>{fullOrder.shippingAddress.country}</p>
                            {fullOrder.shippingAddress.phone && (
                              <p>Phone: {fullOrder.shippingAddress.phone}</p>
                            )}
                          </address>
                        )}
                        
                        {fullOrder.shippingMethod && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Shipping Method</h5>
                            <p className="text-sm text-gray-600">{
                              fullOrder.shippingMethod.charAt(0).toUpperCase() + 
                              fullOrder.shippingMethod.slice(1).replace('_', ' ')
                            }</p>
                          </div>
                        )}
                      </div>

                      {/* Billing Address */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Billing Address</h4>
                        {!fullOrder.billingAddress ? (
                          <p className="text-sm text-gray-500">No billing address provided.</p>
                        ) : (
                          <address className="not-italic text-sm text-gray-600 space-y-1">
                            <p>{fullOrder.billingAddress.firstName} {fullOrder.billingAddress.lastName}</p>
                            <p>{fullOrder.billingAddress.addressLine1}</p>
                            {fullOrder.billingAddress.addressLine2 && (
                              <p>{fullOrder.billingAddress.addressLine2}</p>
                            )}
                            <p>
                              {fullOrder.billingAddress.city}, {fullOrder.billingAddress.state} {' '}
                              {fullOrder.billingAddress.zipCode || fullOrder.billingAddress.postalCode}
                            </p>
                            <p>{fullOrder.billingAddress.country}</p>
                            {fullOrder.billingAddress.phone && (
                              <p>Phone: {fullOrder.billingAddress.phone}</p>
                            )}
                          </address>
                        )}
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

                          {/* Shipment details */}
                          {fullOrder.status === 'shipped' || fullOrder.status === 'delivered' || fullOrder.status === 'completed' ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-700 mb-2">Shipment Details</h5>
                              <dl className="space-y-2">
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <dt className="text-gray-500">Carrier:</dt>
                                  <dd>{(fullOrder.metadata as any)?.carrier || 'Standard Shipping'}</dd>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <dt className="text-gray-500">Tracking Number:</dt>
                                  <dd>{(fullOrder.metadata as any)?.trackingNumber || 'N/A'}</dd>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <dt className="text-gray-500">Estimated Delivery:</dt>
                                  <dd>{(fullOrder.metadata as any)?.estimatedDelivery 
                                    ? formatDate((fullOrder.metadata as any).estimatedDelivery) 
                                    : 'Not available'}</dd>
                                </div>
                              </dl>
                            </div>
                          ) : null}
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