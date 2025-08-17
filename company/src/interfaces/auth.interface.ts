/**
 * Auth-related interfaces
 */

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}
