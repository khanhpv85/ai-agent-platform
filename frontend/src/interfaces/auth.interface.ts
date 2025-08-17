// Auth-related interfaces and types

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  email_verified: boolean;
  last_login_at?: string;
  companies: Company[];
}

export interface Company {
  id: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  refreshExpiresIn: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name: string;
  company_domain?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface LogoutRequest {
  refresh_token: string;
  logout_type?: 'current' | 'all';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
}

export interface UserSession {
  id: string;
  created_at: string;
  last_activity_at: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: {
    is_mobile: boolean;
    is_tablet: boolean;
    browser: string;
  };
}

export interface SessionsResponse {
  sessions: UserSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
