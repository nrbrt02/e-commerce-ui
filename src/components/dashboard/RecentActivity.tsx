import React from "react";

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  timeAgo: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSupplier: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading,
  isAdmin,
  isManager,
  isSupplier,
}) => {
  // Filter activities based on user role
  const filteredActivities = activities.filter((activity) => {
    // Filter customer activities (only for admin/manager)
    if (activity.type === "customer" && !(isAdmin || isManager)) {
      return false;
    }
    
    // Filter revenue activities
    if (
      activity.type === "revenue" &&
      !(isAdmin || isManager || isSupplier)
    ) {
      return false;
    }
    
    return true;
  });

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return (
          <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
            <svg
              className="h-4 w-4 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        );
      case "customer":
        return (
          <div className="rounded-full bg-purple-100 p-2 flex-shrink-0">
            <svg
              className="h-4 w-4 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case "product":
        return (
          <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
            <svg
              className="h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        );
      case "review":
        return (
          <div className="rounded-full bg-yellow-100 p-2 flex-shrink-0">
            <svg
              className="h-4 w-4 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2 flex-shrink-0">
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="animate-pulse p-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="py-4 border-b border-gray-200 last:border-0 flex items-start"
            >
              <div className="rounded-full bg-gray-200 h-8 w-8 mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right">
          <div className="h-5 bg-gray-200 rounded w-32 ml-auto"></div>
        </div>
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-base font-medium text-gray-600">
            No recent activity
          </p>
          <p className="mt-1 text-sm text-gray-500">
            New activities will appear here when they occur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 flex items-start">
            {getActivityIcon(activity.type)}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500">{activity.subtitle}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 px-4 py-3 text-right">
        <button className="text-sm font-medium text-sky-600 hover:text-sky-800">
          View All Activity →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;