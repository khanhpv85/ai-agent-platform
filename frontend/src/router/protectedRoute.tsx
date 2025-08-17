import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '@services/auth.service';
import { RootState, AppDispatch } from '@store';
import { ROUTES } from './constants';
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
    // If we have a token but no user data, fetch the profile
    if (accessToken && !user) {
      dispatch(getProfile());
    }
    setIsInitialized(true);
  }, [accessToken, user, dispatch]);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || !accessToken)) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, accessToken, navigate, isInitialized]);

  // Show loading while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
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
