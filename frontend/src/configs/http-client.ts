import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@store';
import { refreshToken, logout } from '@services/auth.service';

// Custom error class for better error handling
export class ApiError extends Error {
  public status: number;
  public data?: any;
  public originalError?: AxiosError;

  constructor(
    status: number,
    message: string,
    data?: any,
    originalError?: AxiosError
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.originalError = originalError;
  }
}

// Create base axios configuration
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000, // Increased timeout
    headers: {
      'Content-Type': 'application/json',
    },
    // Enable retry logic
    validateStatus: (status: number) => status < 500,
  });

  // Request interceptor to add auth token and logging
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const state = store.getState();
      const token = state.auth.accessToken;
      
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add request ID for tracking
      config.metadata = { startTime: new Date() };
      
      if (__DEV__) {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      
      return config;
    },
    (error: AxiosError) => {
      if (__DEV__) {
        console.error('❌ Request Error:', error);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh and error handling
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();
      
      if (__DEV__) {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, response.data);
      }
      
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      const duration = new Date().getTime() - originalRequest?.metadata?.startTime?.getTime();
      
      if (__DEV__) {
        console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} (${duration}ms)`, error.response?.data);
      }
      
      // If the error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const state = store.getState();
        const refreshTokenValue = state.auth.refreshToken;
        
        if (refreshTokenValue) {
          try {
            // Try to refresh the token
            const result = await store.dispatch(refreshToken(refreshTokenValue) as any);
            
            if (result.meta.requestStatus === 'fulfilled') {
              // Token refreshed successfully, retry the original request
              const newToken = result.payload.accessToken;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return instance(originalRequest);
            } else {
              // Refresh failed, logout user
              store.dispatch(logout('current') as any);
              return Promise.reject(new ApiError(401, 'Authentication failed', null, error));
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            store.dispatch(logout('current') as any);
            return Promise.reject(new ApiError(401, 'Authentication failed', null, error));
          }
        } else {
          // No refresh token available, logout user
          store.dispatch(logout('current') as any);
          return Promise.reject(new ApiError(401, 'No refresh token available', null, error));
        }
      }
      
      // Handle other errors
      const status = error.response?.status || 0;
      const message = error.response?.data?.message || error.message || 'An error occurred';
      const data = error.response?.data;
      
      return Promise.reject(new ApiError(status, message, data, error));
    }
  );

  return instance;
};

// Create service-specific HTTP clients
export const authClient = createAxiosInstance(import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001');
export const companyClient = createAxiosInstance(import.meta.env.VITE_COMPANY_SERVICE_URL || 'http://localhost:3002');
export const aiClient = createAxiosInstance(import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000');

// Default client (for backward compatibility)
export default authClient;
