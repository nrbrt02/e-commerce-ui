import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/ui/ToastProvider";
import CustomerDetailsModal from "../components/dashboard/CustomerDetailsModal";
import CustomerPasswordModal from "../components/dashboard/CustomerPasswordModal";
import customerApi, { Customer } from "../utils/customerApi";
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const Customers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // View customer orders function
  const viewCustomerOrders = (customerId: number) => {
    navigate(`/orders?customerId=${customerId}`);
  };

  // Check user roles with memoization
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user) return false;

      // Check primaryRole first
      if (user.primaryRole === roleName) return true;

      // Check legacy role property
      if (user.role === roleName) return true;

      // Check roles array if it exists
      if (user.roles) {
        return user.roles.some((role) => {
          if (typeof role === "string") return role === roleName;
          return (
            role &&
            typeof role === "object" &&
            "name" in role &&
            role.name === roleName
          );
        });
      }

      return false;
    },
    [user]
  );

  const isAdmin = hasRole("admin");
  const isManager = !isAdmin && hasRole("manager");

  // Debounced fetch function
  const debouncedFetchCustomers = useCallback(
    async (params: Record<string, any>) => {
      setIsLoading(true);
      try {
        const response = await customerApi.getCustomers(params);
        setCustomers(response.data.customers);
        setTotalCustomers(response.pagination.totalCustomers);
        setTotalPages(response.pagination.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load customers");
        showToast.error("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch customers with current filters
  const fetchCustomers = useCallback(async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: resultsPerPage,
      };

      if (searchTerm) params.search = searchTerm;

      if (statusFilter !== "all") {
        if (statusFilter === "verified") {
          params.verified = true;
        } else if (statusFilter === "active") {
          params.active = true;
        } else if (statusFilter === "inactive") {
          params.active = false;
        }
      }

      await debouncedFetchCustomers(params);
    }, 500);
  }, [
    searchTerm,
    statusFilter,
    currentPage,
    resultsPerPage,
    debouncedFetchCustomers,
  ]);

  // Refresh customers
  const refreshCustomers = async () => {
    setIsRefreshing(true);
    await fetchCustomers();
    setIsRefreshing(false);
    showToast.info("Customers refreshed");
  };

  useEffect(() => {
    fetchCustomers();
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchCustomers]);

  // Handle customer deletion with confirmation dialog
  const handleDeleteCustomer = async (customerId: number) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    try {
      await customerApi.deleteCustomer(customerId);
      setCustomers(customers.filter((customer) => customer.id !== customerId));
      showToast.success("Customer deleted successfully");
      // Refresh data if we're on the last page with only one item
      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      showToast.error(
        err.response?.data?.message || "Failed to delete customer"
      );
    }
  };

  // Helper functions
  const getFullName = (customer: Customer): string => {
    return (
      [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
      customer.username
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvatarUrl = (customer: Customer): string => {
    return (
      customer.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        getFullName(customer)
      )}&background=0D9DE3&color=fff`
    );
  };

  // Pagination controls
  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Generate pagination buttons with better mobile support
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = window.innerWidth < 640 ? 3 : 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page button
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 rounded border bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-1 text-gray-500">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </span>
        );
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded border ${
            currentPage === i
              ? "bg-sky-50 border-sky-500 text-sky-600"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-1 text-gray-500">
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </span>
        );
      }
      buttons.push(
        <button
          key="last"
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded border bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-center p-4 border rounded-lg animate-pulse"
        >
          <div className="h-12 w-12 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="py-16 text-center">
      <UserIcon className="mx-auto h-16 w-16 text-gray-300" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        No customers found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm || statusFilter !== "all"
          ? "Try adjusting your search or filter to find what you're looking for."
          : "There are no customers registered yet."}
      </p>
      {(searchTerm || statusFilter !== "all") && (
        <button
          onClick={handleClearFilters}
          className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  // Handle opening modals
  const openDetailsModal = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDetailsModalOpen(true);
  };

  const openPasswordModal = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsPasswordModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Customer Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your customer accounts and information
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={refreshCustomers}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
            >
              <ArrowPathIcon
                className={`-ml-1 mr-2 h-5 w-5 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filters Section */}
      <section className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Customers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                placeholder="Search by name, email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Customers</option>
              <option value="verified">Verified Only</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Results Per Page */}
          <div>
            <label
              htmlFor="resultsPerPage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Results per page
            </label>
            <select
              id="resultsPerPage"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              value={resultsPerPage}
              onChange={(e) => {
                setResultsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || statusFilter !== "all") && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Main Content Section */}
      <section className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          renderLoadingSkeleton()
        ) : customers.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                    >
                      Contact Info
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                    >
                      Registered
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                    >
                      Last Login
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      {/* Customer Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              src={getAvatarUrl(customer)}
                              alt={getFullName(customer)}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                (
                                  e.target as HTMLImageElement
                                ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  getFullName(customer)
                                )}&background=0D9DE3&color=fff`;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {getFullName(customer)}
                              <span className="md:hidden ml-2 text-xs text-gray-500">
                                @{customer.username}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 hidden md:block">
                              @{customer.username}
                            </div>
                            {/* Mobile-only status badges */}
                            <div className="lg:hidden mt-1 flex flex-wrap gap-1">
                              {customer.isVerified && (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Verified
                                </span>
                              )}
                              {customer.isActive ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm text-gray-900">
                            <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="truncate max-w-[200px]">
                              {customer.email}
                            </span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex flex-col gap-2">
                          {customer.isVerified ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Unverified
                            </span>
                          )}
                          {customer.isActive ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-500">
                          {formatDate(customer.lastLogin)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => openDetailsModal(customer)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline flex items-center justify-center"
                            aria-label="View customer details"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {(isAdmin || isManager) && (
                            <>
                              <button
                                onClick={() => openPasswordModal(customer)}
                                className="text-sky-600 hover:text-sky-900 focus:outline-none focus:underline flex items-center justify-center"
                                aria-label="Change customer password"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">
                                  Password
                                </span>
                              </button>

                              <button
                                onClick={() => viewCustomerOrders(customer.id)}
                                className="text-purple-600 hover:text-purple-900 focus:outline-none focus:underline flex items-center justify-center"
                                aria-label="View customer orders"
                              >
                                <ShoppingBagIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Orders</span>
                              </button>

                              <button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 focus:outline-none focus:underline flex items-center justify-center"
                                aria-label="Delete customer"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 sm:px-6">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * resultsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * resultsPerPage, totalCustomers)}
                </span>{" "}
                of <span className="font-medium">{totalCustomers}</span>{" "}
                customers
              </div>

              <div className="flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md border ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {renderPaginationButtons()}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md border ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Modals */}
      {isDetailsModalOpen && currentCustomer && (
        <CustomerDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          customer={currentCustomer}
        />
      )}

      {isPasswordModalOpen && currentCustomer && (
        <CustomerPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          customerId={currentCustomer.id}
        />
      )}
    </div>
  );
};

export default Customers;