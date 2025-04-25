import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import customerApi, { Customer } from "../../utils/customerApi";
import { showToast } from "../ui/ToastProvider";

// CustomerDetailsModal Props type
interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

// CustomerDetailsModal component
const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer>(customer);
  const [isLoading, setIsLoading] = useState(false);

  // Format date helper function
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get full name helper function
  const getFullName = (customer: Customer): string => {
    return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username;
  };

  // Get avatar URL helper function
  const getAvatarUrl = (customer: Customer): string => {
    if (customer.avatar) {
      return customer.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getFullName(customer)
    )}&background=0D9DE3&color=fff`;
  };

  // Toggle customer status (active/inactive)
  const toggleCustomerStatus = async () => {
    setIsLoading(true);
    try {
      // const response = await customerApi.updateCustomer(customer.id, {
      //   isActive: !updatedCustomer.isActive
      // });
      
      setUpdatedCustomer({
        ...updatedCustomer,
        isActive: !updatedCustomer.isActive
      });
      
      showToast.success(`Customer is now ${!updatedCustomer.isActive ? 'active' : 'inactive'}`);
    } catch (error: any) {
      console.error("Error updating customer status:", error);
      showToast.error(error.response?.data?.message || "Failed to update customer status");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle customer verification status
  const toggleVerificationStatus = async () => {
    setIsLoading(true);
    try {
      await customerApi.updateCustomer(customer.id, {
        isVerified: !updatedCustomer.isVerified
      });
      
      setUpdatedCustomer({
        ...updatedCustomer,
        isVerified: !updatedCustomer.isVerified
      });
      
      showToast.success(`Customer is now ${!updatedCustomer.isVerified ? 'verified' : 'unverified'}`);
    } catch (error: any) {
      console.error("Error updating verification status:", error);
      showToast.error(error.response?.data?.message || "Failed to update verification status");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedCustomer({
      ...updatedCustomer,
      [name]: value
    });
  };

  // Save customer data
  const saveCustomerData = async () => {
    setIsLoading(true);
    try {
      await customerApi.updateCustomer(customer.id, {
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        phone: updatedCustomer.phone,
        email: updatedCustomer.email,
        username: updatedCustomer.username
      });
      
      showToast.success("Customer information updated successfully");
      setEditMode(false);
    } catch (error: any) {
      console.error("Error updating customer:", error);
      showToast.error(error.response?.data?.message || "Failed to update customer information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Customer Details
                </Dialog.Title>

                {/* Customer header */}
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
                  <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                    <img
                      src={getAvatarUrl(updatedCustomer)}
                      alt={getFullName(updatedCustomer)}
                      className="h-16 w-16 object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            getFullName(updatedCustomer)
                          )}&background=0D9DE3&color=fff&size=128`;
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">
                      {getFullName(updatedCustomer)}
                    </h4>
                    <div className="text-sm text-gray-500">
                      Customer ID: {updatedCustomer.id}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {updatedCustomer.isVerified ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                      {updatedCustomer.isActive ? (
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
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (editMode) {
                          saveCustomerData();
                        } else {
                          setEditMode(true);
                        }
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <PencilSquareIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      )}
                      {editMode ? "Save Changes" : "Edit Customer"}
                    </button>
                  </div>
                </div>

                {/* Customer details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Username
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            name="username"
                            value={updatedCustomer.username}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          />
                        ) : (
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{updatedCustomer.username}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          First Name
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            name="firstName"
                            value={updatedCustomer.firstName || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">
                            {updatedCustomer.firstName || "-"}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Last Name
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            name="lastName"
                            value={updatedCustomer.lastName || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          />
                        ) : (
                          <div className="text-sm">
                            {updatedCustomer.lastName || "-"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            name="email"
                            value={updatedCustomer.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          />
                        ) : (
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">{updatedCustomer.email}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Phone
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            name="phone"
                            value={updatedCustomer.phone || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          />
                        ) : (
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {updatedCustomer.phone || "-"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Account Status
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="block text-sm font-medium text-gray-700">
                              Account Status
                            </span>
                            <span className="block text-xs text-gray-500">
                              {updatedCustomer.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={toggleCustomerStatus}
                            disabled={isLoading}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                              updatedCustomer.isActive ? "bg-sky-600" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`${
                                updatedCustomer.isActive ? "translate-x-5" : "translate-x-0"
                              } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            >
                              <span
                                className={`${
                                  updatedCustomer.isActive
                                    ? "opacity-0 ease-out duration-100"
                                    : "opacity-100 ease-in duration-200"
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <XCircleIcon className="h-3 w-3 text-gray-400" />
                              </span>
                              <span
                                className={`${
                                  updatedCustomer.isActive
                                    ? "opacity-100 ease-in duration-200"
                                    : "opacity-0 ease-out duration-100"
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <CheckCircleIcon className="h-3 w-3 text-sky-600" />
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="block text-sm font-medium text-gray-700">
                              Verification Status
                            </span>
                            <span className="block text-xs text-gray-500">
                              {updatedCustomer.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={toggleVerificationStatus}
                            disabled={isLoading}
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                              updatedCustomer.isVerified ? "bg-green-600" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`${
                                updatedCustomer.isVerified ? "translate-x-5" : "translate-x-0"
                              } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                            >
                              <span
                                className={`${
                                  updatedCustomer.isVerified
                                    ? "opacity-0 ease-out duration-100"
                                    : "opacity-100 ease-in duration-200"
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <XCircleIcon className="h-3 w-3 text-gray-400" />
                              </span>
                              <span
                                className={`${
                                  updatedCustomer.isVerified
                                    ? "opacity-100 ease-in duration-200"
                                    : "opacity-0 ease-out duration-100"
                                } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                                aria-hidden="true"
                              >
                                <CheckCircleIcon className="h-3 w-3 text-green-600" />
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Activity */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Account Activity
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">
                          Registered On
                        </span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">
                            {formatDate(updatedCustomer.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">
                          Last Login
                        </span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">
                            {formatDate(updatedCustomer.lastLogin)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">
                          Last Updated
                        </span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">
                            {formatDate(updatedCustomer.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer addresses */}
                {updatedCustomer.addresses && updatedCustomer.addresses.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Customer Addresses
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {updatedCustomer.addresses.map((address: any, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-md p-3"
                        >
                          <div className="flex items-start">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <h5 className="text-sm font-medium">
                                {address.label || `Address ${index + 1}`}
                              </h5>
                              <p className="text-xs text-gray-600 mt-1">
                                {[
                                  address.street,
                                  address.city,
                                  address.state,
                                  address.postalCode,
                                  address.country,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                              {address.isDefault && (
                                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer preferences */}
                {updatedCustomer.preferences && Object.keys(updatedCustomer.preferences).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Cog6ToothIcon className="h-4 w-4 mr-1 text-gray-500" />
                      Customer Preferences
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                        {JSON.stringify(updatedCustomer.preferences, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Footer actions */}
                <div className="mt-8 flex justify-end space-x-3">
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setUpdatedCustomer(customer); // Reset to original data
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CustomerDetailsModal;