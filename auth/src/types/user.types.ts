/**
 * User-related types and enums
 */

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

export type UserAuthStatus = 'locked' | 'suspicious' | 'unverified' | 'active';

export type LogoutType = 'current' | 'all';
