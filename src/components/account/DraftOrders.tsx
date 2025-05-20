import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../context/CheckoutContenxt';
import { formatCurrency } from '../../utils/currencyUtils';
import { showToast } from '../ui/ToastProvider';

interface DraftOrder {
  id?: string | number;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: any;
  billingAddress?: any;
  shippingMethod?: string;
  paymentMethod?: string;
  status?: string;
  orderNumber?: string;
  lastUpdated?: string;
}

const DraftOrders: React.FC = () => {
  const navigate = useNavigate();
  const { createDraftOrder, updateDraftOrder } = useCheckout();
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDraftOrders();
  }, []);

  const loadDraftOrders = () => {
    try {
      setIsLoading(true);
      const savedDrafts = localStorage.getItem('checkoutDraftOrderId');
      if (savedDrafts) {
        const draft = JSON.parse(savedDrafts);
        setDraftOrders([draft]);
      }
    } catch (error) {
      console.error('Error loading draft orders:', error);
      showToast.error('Failed to load draft orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueOrder = async (draftOrder: DraftOrder) => {
    try {
      // Save the draft order ID to localStorage
      localStorage.setItem('checkoutDraftOrderId', JSON.stringify(draftOrder));
      
      // Navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error continuing order:', error);
      showToast.error('Failed to continue order');
    }
  };

  const handleDeleteDraft = async (draftOrder: DraftOrder) => {
    try {
      // Remove from localStorage
      localStorage.removeItem('checkoutDraftOrderId');
      
      // Update state
      setDraftOrders([]);
      
      showToast.success('Draft order deleted');
    } catch (error) {
      console.error('Error deleting draft order:', error);
      showToast.error('Failed to delete draft order');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (draftOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No draft orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Draft Orders</h2>
      
      {draftOrders.map((draft) => (
        <div
          key={draft.orderNumber}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Order #{draft.orderNumber}
                </h3>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(draft.lastUpdated || '').toLocaleString()}
                </p>
              </div>
              <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                Draft
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Shipping Address
                </h4>
                {draft.shippingAddress ? (
                  <div className="text-sm text-gray-600">
                    <p>{draft.shippingAddress.firstName} {draft.shippingAddress.lastName}</p>
                    <p>{draft.shippingAddress.address}</p>
                    <p>{draft.shippingAddress.city}, {draft.shippingAddress.state}</p>
                    <p>{draft.shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No shipping address provided</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Order Summary
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Items: {draft.items.length}</p>
                  <p>Subtotal: {formatCurrency(draft.subtotal)}</p>
                  <p>Tax: {formatCurrency(draft.tax)}</p>
                  <p>Shipping: {formatCurrency(draft.shipping)}</p>
                  <p className="font-medium text-gray-900">
                    Total: {formatCurrency(draft.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => handleDeleteDraft(draft)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Delete Draft
              </button>
              <button
                onClick={() => handleContinueOrder(draft)}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Continue Order
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DraftOrders; 