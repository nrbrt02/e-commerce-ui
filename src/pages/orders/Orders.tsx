import React, { useState, useEffect } from "react";
import OrdersFilter from "./OrdersFilter";
import OrdersTable from "./OrdersTable";
import OrdersTabs from "./OrdersTabs";
import Pagination from "./Pagination";
import { OrderStatus, Order } from "../../types/order";
import orderApi from "../../utils/orderApi";
import { toast } from "react-toastify";

const Orders: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query params for filtering
        const queryParams = new URLSearchParams();
        
        // Add current page and limit
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', itemsPerPage.toString());
        
        // Add tab filter if not "all"
        if (selectedTab !== "all") {
          queryParams.append('status', selectedTab);
        }
        
        // Add other filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
        
        // Make API call
        const response = await orderApi.getOrders(queryParams);
        
        setOrders(response.data.orders); 
        setTotalOrders(response.pagination.totalOrders);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [selectedTab, filters, currentPage]);

  // Calculate order counts by status for tab display
  const orderCounts = {
    all: totalOrders,
    [OrderStatus.PENDING]: orders.filter(
      (o) => o.status === OrderStatus.PENDING
    ).length,
    [OrderStatus.PROCESSING]: orders.filter(
      (o) => o.status === OrderStatus.PROCESSING
    ).length,
    [OrderStatus.SHIPPED]: orders.filter(
      (o) => o.status === OrderStatus.SHIPPED
    ).length,
    [OrderStatus.DELIVERED]: orders.filter(
      (o) => o.status === OrderStatus.DELIVERED
    ).length,
    [OrderStatus.COMPLETED]: orders.filter(
      (o) => o.status === OrderStatus.COMPLETED
    ).length,
    [OrderStatus.CANCELLED]: orders.filter(
      (o) => o.status === OrderStatus.CANCELLED
    ).length,
    [OrderStatus.REFUNDED]: orders.filter(
      (o) => o.status === OrderStatus.REFUNDED
    ).length,
    [OrderStatus.DRAFT]: orders.filter((o) => o.status === OrderStatus.DRAFT)
      .length,
  };

  const handleFilter = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleCancelOrder = async (orderId: number, reason?: string): Promise<void> => {
    try {
      await orderApi.cancelOrder(orderId, reason);
      
      // Update the orders list after successful cancellation
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: OrderStatus.CANCELLED } 
          : order
      );
      
      setOrders(updatedOrders);
      toast.success("Order cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order. Please try again.");
      throw err;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Filters */}
      <OrdersFilter onFilter={handleFilter} onReset={handleResetFilters} />

      {/* Tabs */}
      <OrdersTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab as (tab: string) => void}
        counts={orderCounts}
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        onViewOrder={() => {}} 
        onEditOrder={() => {}}
        onCancelOrder={handleCancelOrder}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Orders;