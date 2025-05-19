import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SupplierStats: React.FC = () => {
  const { user } = useAuth();
  
  // Revenue data for past 6 months
  const revenueData = {
    labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Revenue',
        data: [2400, 1900, 3200, 2800, 3800, 4200],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Orders data for past 6 months
  const ordersData = {
    labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Orders',
        data: [23, 18, 30, 27, 42, 38],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };
  
  // Product performance data
  const productData = {
    labels: ['Laptop', 'Mouse', 'Keyboard', 'Headphones', 'USB Hub'],
    datasets: [
      {
        label: 'Sales',
        data: [35, 22, 18, 15, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Performance metrics for {user?.companyName || 'your business'}
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800 uppercase">Total Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-green-900">$18,300</p>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-green-700">+12.5%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 uppercase">Orders</h3>
              <p className="mt-2 text-3xl font-bold text-blue-900">178</p>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-blue-700">+8.2%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 uppercase">Average Order Value</h3>
              <p className="mt-2 text-3xl font-bold text-purple-900">$102.85</p>
              <div className="mt-1 flex items-center text-sm">
                <span className="text-purple-700">+3.7%</span>
                <span className="text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
              <div className="h-72">
                <Line data={revenueData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Orders</h3>
              <div className="h-72">
                <Bar data={ordersData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
              <div className="h-72">
                <Doughnut data={productData} options={chartOptions} />
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Demographics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Top Regions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>New York</span>
                      <span className="text-green-600 font-medium">28%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>California</span>
                      <span className="text-green-600 font-medium">22%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Texas</span>
                      <span className="text-green-600 font-medium">16%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Florida</span>
                      <span className="text-green-600 font-medium">12%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Other</span>
                      <span className="text-green-600 font-medium">22%</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Customer Age</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between">
                      <span>18-24</span>
                      <span className="text-blue-600 font-medium">15%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>25-34</span>
                      <span className="text-blue-600 font-medium">34%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>35-44</span>
                      <span className="text-blue-600 font-medium">28%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>45-54</span>
                      <span className="text-blue-600 font-medium">14%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>55+</span>
                      <span className="text-blue-600 font-medium">9%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierStats;