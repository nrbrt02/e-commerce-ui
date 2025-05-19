import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { CheckoutProvider } from "./context/CheckoutContenxt";
import { ToastProvider } from "./components/ui/ToastProvider";

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
import AuthModal from "./components/auth/AuthModal";
import { SearchProvider } from "./context/SearchContext";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import SupplierStats from "./pages/supplier/SupplierStats";

const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  allowedRoles?: ("admin" | "superadmin" | "supplier" | "customer")[];
  redirectTo?: string;
}> = ({ element, allowedRoles = [], redirectTo = "/account" }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  const hasAccess =
    allowedRoles.length === 0 ||
    allowedRoles.includes(user?.role as any) ||
    allowedRoles.includes(user?.primaryRole as any);

  if (!hasAccess) {
    if (user?.role === "superadmin" || user?.primaryRole === "superadmin" || 
        user?.role === "admin" || user?.primaryRole === "admin" || 
        user?.role === "supplier" || user?.primaryRole === "supplier") {
      return <Navigate to="/dashboard" />;
    }
    return <Navigate to={redirectTo} />;
  }

  return element;
};

const CheckoutWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <CheckoutProvider>{children}</CheckoutProvider>;
};

const FrontendLayout: React.FC = () => {
  return (
    <>
      <TopBar />
      <Header />
      <Navigation />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
    </>
  );
};

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <DashboardHeader toggleSidebar={toggleSidebar} />
      <div className="flex relative">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main
          className={`transition-all duration-300 ease-in-out flex-1 ${
            isSidebarOpen ? "" : "ml-0"
          } p-0`}
        >
          <div className="p-4 md:p-6 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <SearchProvider>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<DashboardLayout />}
                allowedRoles={["admin", "superadmin", "supplier"]}
              />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics" element={<Dashboard />} />
            <Route path="profile" element={<SupplierProfile />} />
            <Route path="stats" element={<SupplierStats />} />
            {/* <Route 
              path="admin-settings" 
              element={
                <ProtectedRoute 
                  element={<AdminSettings />} 
                  allowedRoles={['superadmin']}
                />
              } 
            />
            <Route 
              path="user-management" 
              element={
                <ProtectedRoute 
                  element={<UserManagement />} 
                  allowedRoles={['superadmin']}
                />
              } 
            /> */}
          </Route>

          {/* Redirect /supplier to /dashboard for any supplier-related requests */}
          <Route path="/supplier" element={<Navigate to="/dashboard" />} />
          <Route path="/supplier/*" element={<Navigate to="/dashboard" />} />

          <Route path="/" element={<FrontendLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<AllProducts />} />
            <Route path="search" element={<SearchResults />} />
            <Route
              path="cart"
              element={
                <CheckoutWrapper>
                  <CartPage />
                </CheckoutWrapper>
              }
            />
            <Route path="product/:id" element={<ProductDetail />} />
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
            <Route
              path="account"
              element={
                <ProtectedRoute element={<AccountPage />} allowedRoles={[]} />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SearchProvider>
    </ToastProvider>
  );
};

export default App;