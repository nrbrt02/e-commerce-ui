import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import StatCard from "./StartCard";
const StatsGrid = ({ stats, isLoading, isAdmin, isManager, isSupplier, }) => {
    // Format currency
    const formatCurrency = (value) => {
        return value.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };
    // Welcome message based on user type
    const getWelcomeText = () => {
        // Get current time of day for greeting
        const hour = new Date().getHours();
        let greeting = "Good evening";
        if (hour < 12)
            greeting = "Good morning";
        else if (hour < 18)
            greeting = "Good afternoon";
        return greeting;
    };
    // Format date
    const formattedDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 animate-pulse" })] }), _jsxs("div", { className: "bg-white shadow-md rounded-lg p-6 mb-6 animate-pulse", children: [_jsx("div", { className: "h-6 bg-gray-200 rounded w-2/3 mb-2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [...Array(4)].map((_, index) => (_jsxs("div", { className: "bg-white shadow-md rounded-lg p-6 animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/3 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }, index))) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "Dashboard Overview" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: formattedDate })] }), _jsxs("div", { className: "bg-white shadow-md rounded-lg p-6 mb-6", children: [_jsxs("h2", { className: "text-lg font-medium text-gray-800", children: [getWelcomeText(), "!"] }), _jsxs("p", { className: "mt-1 text-gray-600", children: ["Here's what's happening with your", " ", isAdmin || isManager ? "store" : "account", " today."] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(StatCard, { title: "Total Products", value: stats.totalProducts, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }) }), iconBgColor: "bg-blue-100", iconTextColor: "text-blue-600", trend: {
                            value: 12,
                            isPositive: true,
                            label: "from last month"
                        } }), _jsx(StatCard, { title: "Total Orders", value: stats.totalOrders, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }), iconBgColor: "bg-green-100", iconTextColor: "text-green-600", trend: {
                            value: 8,
                            isPositive: true,
                            label: "this week"
                        } }), (isAdmin || isManager) && (_jsx(StatCard, { title: "Total Customers", value: stats.totalCustomers, icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }), iconBgColor: "bg-purple-100", iconTextColor: "text-purple-600", trend: {
                            value: 5,
                            isPositive: true,
                            label: "new this week"
                        } })), (isAdmin || isManager || isSupplier) && (_jsx(StatCard, { title: isSupplier ? "Your Revenue" : "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), iconBgColor: "bg-yellow-100", iconTextColor: "text-yellow-600", trend: {
                            value: 3.5,
                            isPositive: isAdmin || isManager,
                            label: "from last month"
                        }, subtitle: isSupplier ? "Based on your products" : "Total store revenue" }))] })] }));
};
export default StatsGrid;
