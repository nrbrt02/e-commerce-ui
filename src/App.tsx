import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { CheckoutProvider } from "./context/CheckoutContenxt";
import { ToastProvider } from "./components/ui/ToastProvider";
// import useToast from './utils/toast';

// Import components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartPage from "./pages/Cart";
import CheckoutPage from "./components/checkout/CheckoutPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AccountPage from "./pages/Account";
import AddressBook from "./components/account/AddressBook";
import HomePage from "./components/home/HomePage";
import ProductGridPage from "./components/products/ProductGridPage";
import TopBar from "./components/layout/TopBar";
import Navigation from "./components/layout/Navigation";
import Dashboard from "./pages/Dashboard";
import { DashboardHeader, Sidebar } from "./components/dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";

// Protected route component with staff check
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requireAuth?: boolean;
  requireStaff?: boolean;
}> = ({ element, requireAuth = true, requireStaff = false }) => {
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

  // User is authenticated and has proper permissions
  return element;
};

// Checkout wrapper component to provide CheckoutContext
const CheckoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            isSidebarOpen ? "md:ml-50" : "ml-0"
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

// Address book page with address management functionality
const AddressBookPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/account" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Address Book</h1>
      <AddressBook />
    </div>
  );
};

// Main App component with nested routes
const App: React.FC = () => {
  return (
    <ToastProvider>
      <Routes>
        {/* Dashboard routes with dashboard layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={<DashboardLayout />}
              requireAuth={true}
              requireStaff={true}
            />
          }
        >
          <Route index element={<Dashboard />} />
          {/* Add other dashboard routes here */}
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<Orders />} />
          {/* Example: <Route path="products" element={<DashboardProducts />} /> */}
        </Route>

        {/* Frontend routes with frontend layout */}
        <Route path="/" element={<FrontendLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductGridPage />} />
          
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

          {/* Modified Account route to not require auth since AuthPage handles showing login */}
          <Route
            path="account"
            element={
              <ProtectedRoute element={<AccountPage />} requireAuth={false} />
            }
          />

          <Route
            path="account/addresses"
            element={<ProtectedRoute element={<AddressBookPage />} />}
          />
        </Route>

        {/* Catch-all route redirects to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ToastProvider>
  );
};

export default App;