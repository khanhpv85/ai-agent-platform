import { store } from '@store';
import { logout } from '@services/auth.service';

// Handle authentication errors globally with better UX
export const handleAuthError = (error: any) => {
  console.log('🔐 Handling auth error:', error);
  
  // If it's a 401 error, try to logout and redirect
  if (error?.status === 401 || error?.response?.status === 401) {
    console.log('🔐 401 error detected, showing session expired notification');
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('refreshExpiresIn');
    
    // Dispatch logout action
    store.dispatch(logout({ refresh_token: '', logout_type: 'current' }) as any);
    
    // Show user-friendly notification before redirect
    showSessionExpiredNotification();
  }
};

// Show session expired notification with better UX
const showSessionExpiredNotification = () => {
  // Create a modal/notification element
  const notification = document.createElement('div');
  notification.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  notification.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
      <div class="flex items-center mb-4">
        <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Session Expired</h3>
          <p class="text-sm text-gray-600">Your session has expired for security reasons.</p>
        </div>
      </div>
      <div class="flex justify-end space-x-3">
        <button id="redirect-login" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          Sign In Again
        </button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Handle redirect button click
  const redirectButton = notification.querySelector('#redirect-login');
  redirectButton?.addEventListener('click', () => {
    document.body.removeChild(notification);
    window.location.href = '/login';
  });
  
  // Auto-redirect after 5 seconds if user doesn't click
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
      window.location.href = '/login';
    }
  }, 5000);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const state = store.getState();
  return state.auth.isAuthenticated && !!state.auth.accessToken;
};

// Get current user info
export const getCurrentUser = () => {
  const state = store.getState();
  return state.auth.user;
};

// Get current access token
export const getAccessToken = (): string | null => {
  const state = store.getState();
  return state.auth.accessToken;
};

// Get current refresh token
export const getRefreshToken = (): string | null => {
  const state = store.getState();
  return state.auth.refreshToken;
};
