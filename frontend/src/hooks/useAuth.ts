import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { 
  login, 
  register, 
  logout, 
  getProfile, 
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getUserSessions,
  revokeSession,
  revokeAllSessions
} from '../services/auth.service';
import { clearAuthError } from '../store/reducers';
import { 
  LoginCredentials, 
  RegisterData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ChangePasswordRequest
} from '../interfaces/auth.interface';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!auth.expiresIn) return true;
    
    // Check if token expires in the next 5 minutes
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + auth.expiresIn;
    const fiveMinutesFromNow = now + (5 * 60);
    
    return expiresAt < fiveMinutesFromNow;
  }, [auth.expiresIn]);

  // Check if refresh token is expired
  const isRefreshTokenExpired = useCallback(() => {
    if (!auth.refreshExpiresIn) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + auth.refreshExpiresIn;
    
    return expiresAt < now;
  }, [auth.refreshExpiresIn]);

  // Auto-refresh token if needed
  useEffect(() => {
    if (auth.isAuthenticated && auth.refreshToken && isTokenExpired() && !isRefreshTokenExpired()) {
      dispatch(refreshToken({ refresh_token: auth.refreshToken }) as any);
    }
  }, [auth.isAuthenticated, auth.refreshToken, auth.expiresIn, dispatch, isTokenExpired, isRefreshTokenExpired]);

  // Check token expiration on mount
  useEffect(() => {
    if (auth.isAuthenticated && auth.accessToken && isTokenExpired() && !isRefreshTokenExpired() && auth.refreshToken) {
      dispatch(refreshToken({ refresh_token: auth.refreshToken }) as any);
    }
  }, []);

  // Auto-logout if refresh token is expired
  useEffect(() => {
    if (auth.isAuthenticated && isRefreshTokenExpired()) {
      dispatch(logout({ refresh_token: auth.refreshToken || '', logout_type: 'current' }) as any);
    }
  }, [auth.isAuthenticated, auth.refreshToken, dispatch, isRefreshTokenExpired]);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    const result = await dispatch(login(credentials) as any);
    return result;
  }, [dispatch]);

  const handleRegister = useCallback(async (userData: RegisterData) => {
    const result = await dispatch(register(userData) as any);
    return result;
  }, [dispatch]);

  const handleLogout = useCallback(async (logoutType: 'current' | 'all' = 'current') => {
    const result = await dispatch(logout({ 
      refresh_token: auth.refreshToken || '', 
      logout_type: logoutType 
    }) as any);
    return result;
  }, [dispatch, auth.refreshToken]);

  const handleGetProfile = useCallback(async () => {
    const result = await dispatch(getProfile() as any);
    return result;
  }, [dispatch]);

  const handleForgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    const result = await dispatch(forgotPassword(data) as any);
    return result;
  }, [dispatch]);

  const handleResetPassword = useCallback(async (data: ResetPasswordRequest) => {
    const result = await dispatch(resetPassword(data) as any);
    return result;
  }, [dispatch]);

  const handleVerifyEmail = useCallback(async (data: VerifyEmailRequest) => {
    const result = await dispatch(verifyEmail(data) as any);
    return result;
  }, [dispatch]);

  const handleResendVerification = useCallback(async (data: ResendVerificationRequest) => {
    const result = await dispatch(resendVerification(data) as any);
    return result;
  }, [dispatch]);

  const handleChangePassword = useCallback(async (data: ChangePasswordRequest) => {
    const result = await dispatch(changePassword(data) as any);
    return result;
  }, [dispatch]);

  const handleGetSessions = useCallback(async () => {
    const result = await dispatch(getUserSessions() as any);
    return result;
  }, [dispatch]);

  const handleRevokeSession = useCallback(async (sessionId: string) => {
    const result = await dispatch(revokeSession(sessionId) as any);
    return result;
  }, [dispatch]);

  const handleRevokeAllSessions = useCallback(async () => {
    const result = await dispatch(revokeAllSessions() as any);
    return result;
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresIn: auth.expiresIn,
    refreshExpiresIn: auth.refreshExpiresIn,
    
    // Computed
    isTokenExpired: isTokenExpired(),
    isRefreshTokenExpired: isRefreshTokenExpired(),
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getProfile: handleGetProfile,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    verifyEmail: handleVerifyEmail,
    resendVerification: handleResendVerification,
    changePassword: handleChangePassword,
    getSessions: handleGetSessions,
    revokeSession: handleRevokeSession,
    revokeAllSessions: handleRevokeAllSessions,
    clearError: handleClearError,
  };
};
