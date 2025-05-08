import React from 'react';
import { OrderStatus } from '../../types/order';

interface OrdersTabsProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}

const OrdersTabs: React.FC<OrdersTabsProps> = ({
  selectedTab,
  onTabChange,
  counts
}) => {
  // Define tabs: 'all' plus each order status
  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: OrderStatus.PENDING, label: 'Pending' },
    { id: OrderStatus.PROCESSING, label: 'Processing' },
    { id: OrderStatus.SHIPPED, label: 'Shipped' },
    { id: OrderStatus.DELIVERED, label: 'Delivered' },
    { id: OrderStatus.COMPLETED, label: 'Completed' },
    { id: OrderStatus.CANCELLED, label: 'Cancelled' },
    { id: OrderStatus.REFUNDED, label: 'Refunded' },
    { id: OrderStatus.DRAFT, label: 'Drafts' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex flex-wrap -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-6 text-sm font-medium flex items-center whitespace-nowrap
              ${selectedTab === tab.id 
                ? 'border-b-2 border-sky-500 text-sky-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab.label}
            {counts && counts[tab.id] !== undefined && (
              <span 
                className={`ml-2 py-0.5 px-2 rounded-full text-xs
                  ${selectedTab === tab.id
                    ? 'bg-sky-100 text-sky-600'
                    : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrdersTabs;