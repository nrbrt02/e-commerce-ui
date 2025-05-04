import React from "react";
import { Link } from "react-router-dom";

const QuickActions: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-800 mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link 
          to="/dashboard/products/new" 
          className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="rounded-full bg-sky-100 p-3 mr-4">
            <svg
              className="h-6 w-6 text-sky-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">Add Product</p>
            <p className="text-xs text-gray-500">
              Create a new product listing
            </p>
          </div>
        </Link>
        
        <Link 
          to="/dashboard/orders/pending" 
          className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">Process Orders</p>
            <p className="text-xs text-gray-500">Manage pending orders</p>
          </div>
        </Link>
        
        <Link 
          to="/dashboard/inventory" 
          className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">Update Inventory</p>
            <p className="text-xs text-gray-500">Adjust stock levels</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;