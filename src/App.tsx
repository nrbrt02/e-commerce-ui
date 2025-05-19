import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { CheckoutProvider } from "./context/CheckoutContenxt";
import { ToastProvider } from "./components/ui/ToastProvider";

// Import components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartPage from "./pages/Cart";
import CheckoutPage from "./components/checkout/CheckoutPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AccountPage from "./pages/Account";
import AllProducts from "./pages/products/AllProducts";
import HomePage from "./components/home/HomePage";
import TopBar from "./components/layout/TopBar";
import Navigation from "./components/layout/Navigation";
import Dashboard from "./pages/Dashboard";
import { DashboardHeader, Sidebar } from "./components/dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Reviews from "./pages/reviews/Review";
import SearchResults from "./pages/searchResults/SearchResults";

// Auth components
import AuthModal from "./components/auth/AuthModal";

// Search context
import { SearchProvider } from "./context/SearchContext";

// New supplier pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierOrders from "./pages/supplier/SupplierOrders";
import SupplierProducts from "./pages/supplier/SupplierProducts";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import SupplierStats from "./pages/supplier/SupplierStats";

// Protected route component with staff and role check
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requireAuth?: boolean;
  requireStaff?: boolean;
  requiredRole?: "admin" | "supplier" | "customer" | undefined;
}> = ({ element, requireAuth = true, requireStaff = false, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If requireAuth is false, we don't need to check authentication
  if (!requireAuth) {
    return element;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/account" />;
  }

  // Check if staff access is required
  if (requireStaff && !user?.isStaff) {
    return <Navigate to="/account" />;
  }

  // Check if specific role is required
  if (
    requiredRole &&
    user?.primaryRole !== requiredRole &&
    user?.role !== requiredRole
  ) {
    // Redirect based on user's actual role
    if (
      user?.primaryRole === "admin" ||
      user?.role === "admin" ||
      user?.role === "superadmin" ||
      user?.primaryRole === "superadmin"
    ) {
      return <Navigate to="/dashboard" />;
    } else if (user?.primaryRole === "supplier" || user?.role === "supplier") {
      return <Navigate to="/supplier" />;
    } else {
      return <Navigate to="/account" />;
    }
  }

  // User is authenticated and has proper permissions
  return element;
};

// Checkout wrapper component to provide CheckoutContext
const CheckoutWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <CheckoutProvider>{children}</CheckoutProvider>;
};

// Frontend layout component
const FrontendLayout: React.FC = () => {
  return (
    <>
      <TopBar />
      <Header />
      <Navigation />
      <main className="min-h-screen">
        <Outlet /> {/* This is where child routes will be rendered */}
      </main>
      <Footer />
      <AuthModal />{" "}
      {/* Add the auth modal here so it's available throughout the frontend */}
    </>
  );
};

// Dashboard layout component with Sidebar and DashboardHeader
const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Call once on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when location changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header Component */}
      <DashboardHeader toggleSidebar={toggleSidebar} />

      {/* Main Content with Sidebar */}
      <div className="flex relative">
        {/* Sidebar Component */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Content Area */}
        <main
          className={`transition-all duration-300 ease-in-out flex-1 ${
            isSidebarOpen ? "md:ml-64" : "ml-0"
          } p-0`}
        >
          <div className="p-4 md:p-6 w-full">
            <Outlet />{" "}
            {/* This is where the dashboard content will be rendered */}
          </div>
        </main>
      </div>
    </div>
  );
};

// Supplier Dashboard Layout
const SupplierLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Close sidebar by default on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Call once on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar when location changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // We could create a specific SupplierSidebar component, but for now we'll use the same DashboardHeader/Sidebar
  // with adjusted content based on user role (handled in those components)
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header Component */}
      <DashboardHeader toggleSidebar={toggleSidebar} />

      {/* Main Content with Sidebar */}
      <div className="flex relative">
        {/* Sidebar Component */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isSupplier={true}
        />

        {/* Content Area */}
        <main
          className={`transition-all duration-300 ease-in-out flex-1 ${
            isSidebarOpen ? "md:ml-64" : "ml-0"
          } p-0`}
        >
          <div className="p-4 md:p-6 w-full">
            <Outlet />{" "}
            {/* This is where the supplier dashboard content will be rendered */}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main App component with nested routes
const App: React.FC = () => {
  return (
    <ToastProvider>
      <SearchProvider>
        <Routes>
          {/* Admin Dashboard routes with dashboard layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<DashboardLayout />}
                requireAuth={true}
                requireStaff={true}
                requiredRole="admin"
              />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>

          {/* Supplier Dashboard routes with supplier layout */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute
                element={<SupplierLayout />}
                requireAuth={true}
                requireStaff={true}
                requiredRole="supplier"
              />
            }
          >
            <Route index element={<SupplierDashboard />} />
            <Route path="products" element={<SupplierProducts />} />
            <Route path="orders" element={<SupplierOrders />} />
            <Route path="profile" element={<SupplierProfile />} />
            <Route path="stats" element={<SupplierStats />} />
          </Route>

          {/* Frontend routes with frontend layout */}
          <Route path="/" element={<FrontendLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<AllProducts />} />
            <Route path="search" element={<SearchResults />} />

            {/* Cart page wrapped with CheckoutProvider */}
            <Route
              path="cart"
              element={
                <CheckoutWrapper>
                  <CartPage />
                </CheckoutWrapper>
              }
            />

            <Route path="product/:id" element={<ProductDetail />} />

            {/* Checkout routes with provider */}
            <Route
              path="checkout"
              element={
                <CheckoutProvider>
                  <CheckoutPage />
                </CheckoutProvider>
              }
            />

            <Route
              path="checkout/success"
              element={
                <CheckoutProvider>
                  <CheckoutSuccess />
                </CheckoutProvider>
              }
            />

            {/* Modified Account route to not require auth since AccountPage handles showing login */}
            <Route
              path="account"
              element={
                <ProtectedRoute element={<AccountPage />} requireAuth={false} />
              }
            />
          </Route>

          {/* Catch-all route redirects to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SearchProvider>
    </ToastProvider>
  );
};

export default App;
