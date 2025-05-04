import React from "react";
import { Link } from "react-router-dom";

const SupplierActions: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-800 mb-3">
        Supply Management
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link 
          to="/dashboard/inventory" 
          className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <svg
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">Update Inventory</p>
            <p className="text-xs text-gray-500">
              Update your product stock
            </p>
          </div>
        </Link>
        
        <Link 
          to="/dashboard/deliveries" 
          className="bg-white shadow-md rounded-lg p-4 flex items-center text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="rounded-full bg-pink-100 p-3 mr-4">
            <svg
              className="h-6 w-6 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">Delivery Schedule</p>
            <p className="text-xs text-gray-500">
              View upcoming deliveries
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SupplierActions;