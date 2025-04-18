// src/utils/authDebug.ts

/**
 * Utility function to check the current authentication state in local storage
 * This can be called from the browser console to debug authentication issues
 */
export const debugAuthState = () => {
  const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'fast_shopping_token';
  const AUTH_USER_KEY = import.meta.env.VITE_AUTH_USER_KEY || 'fast_shopping_user';
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  
  console.group('Authentication Debug Info');
  console.log('Token exists:', !!token);
  if (token) {
    // Show token expiration if it's a JWT
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        
        if (payload.exp) {
          const expiresAt = new Date(payload.exp * 1000);
          const isExpired = expiresAt < new Date();
          console.log('Token expires at:', expiresAt.toLocaleString());
          console.log('Token is expired:', isExpired);
        }
      }
    } catch (e) {
      console.log('Not a standard JWT token');
    }
  }
  
  console.log('User data exists:', !!userJson);
  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      console.log('User data:', userData);
      console.log('Is staff or admin:', 
        userData.isStaff || 
        userData.role === 'admin' || 
        userData.role === 'manager' || 
        userData.role === 'supplier' ||
        (userData.roles && userData.roles.some(r => ['admin', 'manager', 'supplier'].includes(r)))
      );
    } catch (e) {
      console.log('Failed to parse user data:', e);
    }
  }
  
  console.log('Environment variables:');
  console.log('- API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('- AUTH_TOKEN_KEY:', AUTH_TOKEN_KEY);
  console.log('- AUTH_USER_KEY:', AUTH_USER_KEY);
  
  console.groupEnd();
  
  return {
    hasToken: !!token,
    hasUserData: !!userJson,
    userDataString: userJson,
    tokenString: token
  };
};

// Make it available in window for easy console access
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugAuthState = debugAuthState;
}

export default debugAuthState;