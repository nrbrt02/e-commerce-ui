import React, { useState } from 'react';
import { OrderStatus, PaymentStatus, Order } from '../../types/order';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ViewOrderModal from './ViewOrderModal';
import CancelOrderModal from './CancelOrderModal';

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (orderId: number) => void;
  onEditOrder: (orderId: number) => void;
  onCancelOrder: (orderId: number, reason?: string) => Promise<void>;
  isLoading: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onCancelOrder,
  isLoading
}) => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Status badge colors
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Payment status badge colors
  const getPaymentStatusBadgeClass = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle view order
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  // Handle cancel order
  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  // Confirm cancel order
  const confirmCancelOrder = async (reason?: string) => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    try {
      await onCancelOrder(selectedOrder.id, reason);
      setCancelModalOpen(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (orders.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="py-12 text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table - hidden on small screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(order.updatedAt, true)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewOrder(order)} 
                      className="text-sky-600 hover:text-sky-900 mr-3"
                    >
                      View
                    </button>
                    {order.status !== OrderStatus.CANCELLED && 
                      order.status !== OrderStatus.REFUNDED && 
                      order.status !== OrderStatus.COMPLETED && (
                      <button 
                        onClick={() => handleCancelOrder(order)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - shown only on small screens */}
        <div className="md:hidden">
          {orders.map((order) => (
            <div key={order.id} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-semibold">{order.orderNumber}</div>
                  <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                <button 
                  onClick={() => handleViewOrder(order)} 
                  className="px-3 py-1 text-xs font-medium text-sky-600 hover:text-sky-900 border border-sky-200 rounded-md"
                >
                  View
                </button>
                {order.status !== OrderStatus.CANCELLED && 
                  order.status !== OrderStatus.REFUNDED && 
                  order.status !== OrderStatus.COMPLETED && (
                  <button 
                    onClick={() => handleCancelOrder(order)} 
                    className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-900 border border-red-200 rounded-md"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <ViewOrderModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          order={selectedOrder}
        />
      )}

      {/* Cancel Order Modal */}
      {selectedOrder && (
        <CancelOrderModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={confirmCancelOrder}
          orderNumber={selectedOrder.orderNumber}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
};

export default OrdersTable;