import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const RecentActivity = ({ activities, isLoading, isAdmin, isManager, isSupplier, }) => {
    // Filter activities based on user role
    const filteredActivities = activities.filter((activity) => {
        // Filter customer activities (only for admin/manager)
        if (activity.type === "customer" && !(isAdmin || isManager)) {
            return false;
        }
        // Filter revenue activities
        if (activity.type === "revenue" &&
            !(isAdmin || isManager || isSupplier)) {
            return false;
        }
        return true;
    });
    // Get activity icon based on type
    const getActivityIcon = (type) => {
        switch (type) {
            case "order":
                return (_jsx("div", { className: "rounded-full bg-green-100 p-2 flex-shrink-0", children: _jsx("svg", { className: "h-4 w-4 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }) }));
            case "customer":
                return (_jsx("div", { className: "rounded-full bg-purple-100 p-2 flex-shrink-0", children: _jsx("svg", { className: "h-4 w-4 text-purple-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }));
            case "product":
                return (_jsx("div", { className: "rounded-full bg-blue-100 p-2 flex-shrink-0", children: _jsx("svg", { className: "h-4 w-4 text-blue-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }) }) }));
            case "review":
                return (_jsx("div", { className: "rounded-full bg-yellow-100 p-2 flex-shrink-0", children: _jsx("svg", { className: "h-4 w-4 text-yellow-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }) }) }));
            default:
                return (_jsx("div", { className: "rounded-full bg-gray-100 p-2 flex-shrink-0", children: _jsx("svg", { className: "h-4 w-4 text-gray-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }));
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "bg-white shadow-md rounded-lg overflow-hidden", children: [_jsx("div", { className: "animate-pulse p-4", children: [...Array(5)].map((_, index) => (_jsxs("div", { className: "py-4 border-b border-gray-200 last:border-0 flex items-start", children: [_jsx("div", { className: "rounded-full bg-gray-200 h-8 w-8 mr-3" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/2 mb-1" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/4" })] })] }, index))) }), _jsx("div", { className: "bg-gray-50 px-4 py-3 text-right", children: _jsx("div", { className: "h-5 bg-gray-200 rounded w-32 ml-auto" }) })] }));
    }
    if (filteredActivities.length === 0) {
        return (_jsx("div", { className: "bg-white shadow-md rounded-lg overflow-hidden", children: _jsxs("div", { className: "p-8 text-center", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("p", { className: "mt-2 text-base font-medium text-gray-600", children: "No recent activity" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "New activities will appear here when they occur." })] }) }));
    }
    return (_jsxs("div", { className: "bg-white shadow-md rounded-lg overflow-hidden", children: [_jsx("div", { className: "divide-y divide-gray-200", children: filteredActivities.map((activity) => (_jsxs("div", { className: "p-4 hover:bg-gray-50 flex items-start", children: [getActivityIcon(activity.type), _jsxs("div", { className: "ml-3", children: [_jsx("p", { className: "text-sm font-medium text-gray-800", children: activity.title }), _jsx("p", { className: "text-xs text-gray-500", children: activity.subtitle }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: activity.timeAgo })] })] }, activity.id))) }), _jsx("div", { className: "bg-gray-50 px-4 py-3 text-right", children: _jsx("button", { className: "text-sm font-medium text-sky-600 hover:text-sky-800", children: "View All Activity \u2192" }) })] }));
};
export default RecentActivity;
