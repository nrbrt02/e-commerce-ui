import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requireStaff?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireStaff = false }) => {
  const { user, isAuthenticated, isLoading, openAuthModal } = useAuth();
  const location = useLocation();

  // Check if user has the required role/permissions
  const hasRequiredRole = () => {
    if (!requireStaff) {
      // If staff is not required, any authenticated user can access
      return true;
    }
    
    // If staff/admin is required, check if user has staff role
    return user?.isStaff || 
           user?.role === 'admin' || 
           user?.role === 'manager' || 
           user?.role === 'supplier' ||
           (user?.roles && (
             user.roles.includes('admin') || 
             user.roles.includes('manager') || 
             user.roles.includes('supplier')
           ));
  };

  // Show auth modal if user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [isLoading, isAuthenticated, openAuthModal]);

  // While checking auth status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user doesn't have the required role, redirect to dashboard
  if (requireStaff && !hasRequiredRole()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;