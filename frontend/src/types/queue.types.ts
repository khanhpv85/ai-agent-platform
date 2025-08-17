/**
 * Queue-related types and interfaces
 */

export interface QueueMessage {
  id: number;
  type: string;
  content: string;
  status: string;
  priority: string;
  created_at: string;
  agent: string;
}

export type MessageType = 'email' | 'chat' | 'task' | 'notification';
export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type MessagePriority = 'low' | 'medium' | 'high';

export interface QueueFilters {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
}
