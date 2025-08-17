/**
 * API Types - Frontend API communication types
 * Focused on what frontend actually needs for API calls
 */

// Base API response structure
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
}

// Error response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Paginated response
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth API Types
export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  email_verified: boolean;
  companies: UserCompany[];
}

export interface UserCompany {
  id: string;
  name: string;
  role: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface LoginResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

export interface ChangePasswordResponse {
  message: string;
}

// Company API Types
export interface Company {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'active' | 'inactive' | 'training';
  company_id: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  company_id: string;
}

// AI API Types
export interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'active' | 'inactive' | 'training' | 'error';
}

export interface AIConversation {
  id: string;
  user_id: string;
  agent_id: string;
  title?: string;
  status: 'active' | 'archived';
  messages: AIMessage[];
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Common API Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
}
