/**
 * Queue-related interfaces
 */

export interface QueueMessage {
  id: string;
  queueName: string;
  messageType: string;
  payload: any;
  priority?: string;
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
