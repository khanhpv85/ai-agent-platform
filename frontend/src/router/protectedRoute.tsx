import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, refreshToken } from '@services/auth.service';
import { RootState, AppDispatch } from '@store';
import { ROUTES } from './constants';
import { setTokens } from '@store/reducers';
import { setupTokenRefresh } from '@utils/tokenUtils';
// import { LoadingSpinner } from '../components/UI';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, accessToken, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      // Initialize tokens from localStorage if they exist
      const accessToken = localStorage.getItem('accessToken');
      const refreshTokenValue = localStorage.getItem('refreshToken');
      const expiresIn = localStorage.getItem('expiresIn');
      const refreshExpiresIn = localStorage.getItem('refreshExpiresIn');

      if (accessToken && refreshTokenValue && expiresIn && refreshExpiresIn) {
        // Check if token is expired
        const tokenExpiry = parseInt(expiresIn) * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (now < tokenExpiry) {
          // Token is still valid, restore it to Redux store
          console.log('🔐 Token is valid, restoring from localStorage');
          dispatch(setTokens({
            accessToken,
            refreshToken: refreshTokenValue,
            expiresIn: parseInt(expiresIn),
            refreshExpiresIn: parseInt(refreshExpiresIn),
          }));
        } else {
          // Token is expired, try to refresh it
          console.log('🔄 Token is expired, attempting to refresh...');
          try {
            const result = await dispatch(refreshToken({ refresh_token: refreshTokenValue }) as any);
            
            if (result.meta.requestStatus === 'fulfilled') {
              console.log('✅ Token refreshed successfully on page load');
              // Token refreshed successfully, user can continue
            } else {
              console.log('❌ Token refresh failed on page load, clearing tokens');
              // Refresh failed, clear localStorage
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('expiresIn');
              localStorage.removeItem('refreshExpiresIn');
            }
          } catch (error) {
            console.log('❌ Token refresh error on page load:', error);
            // Refresh failed, clear localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('expiresIn');
            localStorage.removeItem('refreshExpiresIn');
          }
        }
      }

      // If we have a token but no user data, fetch the profile
      const storedAccessToken = localStorage.getItem('accessToken');
      if (storedAccessToken && !user) {
        dispatch(getProfile());
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, [user, dispatch]);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || !accessToken)) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, accessToken, navigate, isInitialized]);

  // Set up automatic token refresh when user is authenticated
  // COMMENTED OUT: Auto-refresh interval disabled
  // Now token will only refresh when user interacts with app and encounters expired token
  // useEffect(() => {
  //   if (isAuthenticated && accessToken) {
  //     const refreshInterval = setupTokenRefresh();
  //     
  //     // Cleanup interval on unmount
  //     return () => {
  //       clearInterval(refreshInterval);
  //     };
  //   }
  // }, [isAuthenticated, accessToken]);

  // Show loading while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            {loading ? 'Refreshing session...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
