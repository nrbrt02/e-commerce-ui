import React from 'react';
import { useAuth } from '../../context/AuthContext';

const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Supplier Dashboard</h1>
        <p className="text-gray-600 mb-2">Welcome back, {user?.firstName || user?.contactPerson || user?.username}!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 text-lg mb-2">Products</h3>
            <p className="text-3xl font-bold text-green-800">24</p>
            <p className="text-green-600 text-sm mt-2">3 need restock</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 text-lg mb-2">Orders</h3>
            <p className="text-3xl font-bold text-blue-800">12</p>
            <p className="text-blue-600 text-sm mt-2">5 pending fulfillment</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-700 text-lg mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-purple-800">$1,234</p>
            <p className="text-purple-600 text-sm mt-2">+15% from last month</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">#ORD-5782</td>
                <td className="px-4 py-3 whitespace-nowrap">2025-05-18</td>
                <td className="px-4 py-3 whitespace-nowrap">John Doe</td>
                <td className="px-4 py-3 whitespace-nowrap">$96.50</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">#ORD-5781</td>
                <td className="px-4 py-3 whitespace-nowrap">2025-05-17</td>
                <td className="px-4 py-3 whitespace-nowrap">Sarah Smith</td>
                <td className="px-4 py-3 whitespace-nowrap">$125.00</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Shipped</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap">#ORD-5780</td>
                <td className="px-4 py-3 whitespace-nowrap">2025-05-17</td>
                <td className="px-4 py-3 whitespace-nowrap">Michael Brown</td>
                <td className="px-4 py-3 whitespace-nowrap">$58.25</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Delivered</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button className="text-blue-600 hover:text-blue-800">View all orders →</button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;