/**
 * Queue-related interfaces
 */

export interface QueueMessage {
  queueName: string;
  messageType: string;
  payload: any;
  priority?: string;
  delay?: number;
  retryCount?: number;
  maxRetries?: number;
  metadata?: any;
}

export interface UserRegistrationData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_name?: string;
  company_domain?: string;
}

export interface UserLoginData {
  user_id: string;
  email: string;
  ip_address?: string;
  user_agent?: string;
}

export interface UserLogoutData {
  user_id: string;
  email: string;
  logout_type: string;
}
