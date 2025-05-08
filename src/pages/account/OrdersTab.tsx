import React, { useEffect, useState } from "react";
import orderApi from "../../utils/orderApi";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import OrderDetailsModal from "./OrderDetailsModal";

// Define types for the API response
interface ApiResponse {
  status: string;
  results?: number;
  pagination?: {
    totalOrders: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  data?: {
    orders: Order[];
  };
}

interface Order {
  id: string | number;
  orderNumber: string;
  status: string;
  createdAt: string;
  totalAmount: string;
  totalItems: number;
  paymentStatus: string;
  paymentMethod: string | null;
  shippingMethod: string;
  shippingAddress: any;
  billingAddress: any;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: string;
    total: string;
    sku?: string;
  }>;
}

type OrderStatus = "all" | "draft" | "pending" | "completed" | "cancelled";

const OrdersTab: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Format currency as RWF
  const formatCurrency = (amount: string | number = "0") => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(isNaN(num) ? 0 : num); // Handle NaN cases
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await orderApi.getOrderHistory();

        // Handle both array response and structured API response
        let orders: Order[] = [];
        let paginationData = {
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        };

        if (Array.isArray(response)) {
          // Direct array response (legacy)
          orders = response;
        } else {
          // Structured API response
          const apiResponse = response as ApiResponse;
          orders = apiResponse.data?.orders || [];

          if (apiResponse.pagination) {
            paginationData = {
              currentPage: apiResponse.pagination.currentPage,
              totalPages: apiResponse.pagination.totalPages,
              hasNextPage: apiResponse.pagination.hasNextPage,
              hasPrevPage: apiResponse.pagination.hasPrevPage,
            };
          }
        }

        setAllOrders(orders);
        setPagination(paginationData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (allOrders.length === 0) return;

    let filtered = [...allOrders];

    switch (activeTab) {
      case "draft":
        filtered = filtered.filter((order) => order.status === "draft");
        break;
      case "pending":
        filtered = filtered.filter((order) =>
          ["pending", "processing"].includes(order.status.toLowerCase())
        );
        break;
      case "completed":
        filtered = filtered.filter((order) =>
          ["completed", "delivered"].includes(order.status.toLowerCase())
        );
        break;
      case "cancelled":
        filtered = filtered.filter((order) =>
          ["cancelled", "refunded"].includes(order.status.toLowerCase())
        );
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    setFilteredOrders(filtered);
  }, [activeTab, allOrders]);

  const handleCancelOrder = async (orderId: string | number) => {
    try {
      if (window.confirm("Are you sure you want to cancel this order?")) {
        await orderApi.cancelOrder(orderId);
        // Refresh orders after cancellation
        const updatedOrders = allOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        );
        setAllOrders(updatedOrders);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError("Failed to cancel order. Please try again.");
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusCount = (status: OrderStatus) => {
    if (status === "all") return allOrders.length;
    if (status === "draft")
      return allOrders.filter((o) => o.status === "draft").length;
    if (status === "pending")
      return allOrders.filter((o) =>
        ["pending", "processing"].includes(o.status.toLowerCase())
      ).length;
    if (status === "completed")
      return allOrders.filter((o) =>
        ["completed", "delivered"].includes(o.status.toLowerCase())
      ).length;
    if (status === "cancelled")
      return allOrders.filter((o) =>
        ["cancelled", "refunded"].includes(o.status.toLowerCase())
      ).length;
    return 0;
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-sky-50 border-b border-gray-200">
          <h2 className="font-medium text-sky-800">My Orders</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-3 text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-sky-50 border-b border-gray-200">
          <h2 className="font-medium text-sky-800">My Orders</h2>
        </div>
        <div className="p-8 text-center bg-gray-50">
          <div className="text-red-500">
            <i className="fas fa-exclamation-circle text-3xl mb-3"></i>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 inline-block text-sky-600 hover:text-sky-800 hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-sky-50 border-b border-gray-200">
          <h2 className="font-medium text-sky-800">My Orders</h2>
        </div>
        <div className="p-8 text-center bg-gray-50">
          <div className="text-gray-500">
            <i className="fas fa-shopping-bag text-3xl mb-3"></i>
            <p>You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="mt-3 inline-block text-sky-600 hover:text-sky-800 hover:underline"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-sky-50 border-b border-gray-200">
        <h2 className="font-medium text-sky-800">My Orders</h2>
      </div>

      {/* Order Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {(
            [
              "all",
              "draft",
              "pending",
              "completed",
              "cancelled",
            ] as OrderStatus[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {getStatusCount(tab)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">
                    #{order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="font-bold mt-1">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                {order.items.slice(0, 2).map((item) => (
                  <p key={item.id} className="text-sm text-gray-600 truncate">
                    {item.quantity} × {item.name}
                  </p>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={() => handleViewOrder(order)}
                  className="text-sky-600 hover:text-sky-800 hover:underline text-sm"
                >
                  View Details
                </button>

                {order.status.toLowerCase() === "pending" && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-red-600 hover:text-red-800 hover:underline text-sm"
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === "draft" && (
                  <Link
                    to={`/checkout?draftOrderId=${order.id}`}
                    className="px-3 py-1 bg-sky-600 text-white text-sm rounded hover:bg-sky-700 transition-colors"
                  >
                    Complete Order
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage - 1,
                }))
              }
              className={`px-4 py-2 rounded-md ${
                pagination.hasPrevPage
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: prev.currentPage + 1,
                }))
              }
              className={`px-4 py-2 rounded-md ${
                pagination.hasNextPage
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default OrdersTab;
