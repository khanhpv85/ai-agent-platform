/**
 * User-related types and enums
 */

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

/**
 * Authentication form types
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
}
