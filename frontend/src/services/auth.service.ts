import { createAsyncThunk } from '@reduxjs/toolkit';
import { authClient } from '@configs/http-client';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  SessionsResponse
} from '../interfaces/auth.interface';
import { 
  setUser, 
  setTokens, 
  clearAuth, 
  setAuthLoading, 
  setAuthError, 
  clearAuthError 
} from '../store/reducers';

// Helper function to save tokens to localStorage
const saveTokens = (accessToken: string, refreshToken: string, expiresIn: number, refreshExpiresIn: number) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('expiresIn', expiresIn.toString());
  localStorage.setItem('refreshExpiresIn', refreshExpiresIn.toString());
};

// Helper function to clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('expiresIn');
  localStorage.removeItem('refreshExpiresIn');
};

// API Service functions
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await authClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await authClient.post('/auth/register', userData);
    return response.data;
  },

  refreshToken: async (refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await authClient.post('/auth/refresh-token', refreshTokenData);
    return response.data;
  },

  logout: async (logoutData: LogoutRequest) => {
    try {
      await authClient.post('/auth/logout', logoutData);
    } catch (error) {
      // Even if logout fails, clear local tokens
      console.warn('Logout request failed, but clearing local tokens');
    }
    clearTokens();
  },

  getProfile: async () => {
    const response = await authClient.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await authClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await authClient.post('/auth/reset-password', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await authClient.post('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (data: ResendVerificationRequest) => {
    const response = await authClient.post('/auth/resend-verification', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await authClient.put('/auth/change-password', data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await authClient.put('/auth/profile', data);
    return response.data;
  },

  getUserSessions: async (): Promise<SessionsResponse> => {
    const response = await authClient.get('/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string) => {
    await authClient.delete(`/auth/sessions/${sessionId}`);
  },

  revokeAllSessions: async () => {
    await authClient.delete('/auth/sessions');
  },
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.login(credentials);
      
      // Save tokens to localStorage
      saveTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.refresh_expires_in
      );
      
      // Update store
      dispatch(setUser(response.user));
      dispatch(setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        refreshExpiresIn: response.refresh_expires_in,
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.register(userData);
      
      // Save tokens to localStorage
      saveTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.refresh_expires_in
      );
      
      // Update store
      dispatch(setUser(response.user));
      dispatch(setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        refreshExpiresIn: response.refresh_expires_in,
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshTokenData: RefreshTokenRequest, { dispatch, rejectWithValue }: any) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.refreshToken(refreshTokenData);
      
      // Save tokens to localStorage
      saveTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.refresh_expires_in
      );
      
      // Update store
      dispatch(setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
        refreshExpiresIn: response.refresh_expires_in,
      }));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token refresh failed';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (logoutData: LogoutRequest, { dispatch }) => {
    try {
      await authAPI.logout(logoutData);
    } catch (error) {
      // Even if logout fails, clear local state
      console.warn('Logout request failed, but clearing local state');
    } finally {
      // Always clear local state
      dispatch(clearAuth());
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.getProfile();
      
      // Update store
      dispatch(setUser(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get profile';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.forgotPassword(data);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.resetPassword(data);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (data: VerifyEmailRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.verifyEmail(data);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to verify email';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (data: ResendVerificationRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.resendVerification(data);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: ChangePasswordRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.changePassword(data);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.updateProfile(data);
      
      // Update the user in the store
      dispatch(setUser(response));
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const getUserSessions = createAsyncThunk(
  'auth/getUserSessions',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      const response = await authAPI.getUserSessions();
      
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get user sessions';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const revokeSession = createAsyncThunk(
  'auth/revokeSession',
  async (sessionId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      await authAPI.revokeSession(sessionId);
      
      return sessionId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to revoke session';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

export const revokeAllSessions = createAsyncThunk(
  'auth/revokeAllSessions',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());
      
      await authAPI.revokeAllSessions();
      
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to revoke all sessions';
      dispatch(setAuthError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);
