import { store } from '@store';
import { refreshToken } from '@services/auth.service';

// Check if token is expired or will expire soon (within 2 minutes)
export const isTokenExpired = (expiresIn: number): boolean => {
  const now = Date.now();
  const tokenExpiry = expiresIn * 1000; // Convert to milliseconds
  const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
  
  return now >= (tokenExpiry - twoMinutes);
};

// Refresh token when user interacts with app and token is expired
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const state = store.getState();
  const { accessToken, refreshToken: refreshTokenValue, expiresIn } = state.auth;
  
  if (!accessToken || !refreshTokenValue || !expiresIn) {
    console.log('🔐 No tokens available for refresh');
    return false;
  }
  
  if (isTokenExpired(expiresIn)) {
    console.log('🔄 Token expired, refreshing due to user interaction...');
    try {
      const result = await store.dispatch(refreshToken({ refresh_token: refreshTokenValue }) as any);
      const success = result.meta.requestStatus === 'fulfilled';
      console.log(success ? '✅ Token refreshed successfully' : '❌ Token refresh failed');
      return success;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
  
  console.log('🔐 Token is still valid, no refresh needed');
  return true;
};

// Set up automatic token refresh
export const setupTokenRefresh = (): number => {
  return setInterval(async () => {
    await refreshTokenIfNeeded();
  }, 60000); // Check every minute
};
