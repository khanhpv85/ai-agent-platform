export interface QueueMessage {
  id: string;
  queueName: string;
  messageType: string;
  payload: any;
  priority?: string;
  scheduledAt?: Date;
  metadata?: any;
}

export interface QueueOptions {
  priority?: string;
  delay?: number; // milliseconds
  retryCount?: number;
  maxRetries?: number;
  metadata?: any;
}

export interface QueueProvider {
  /**
   * Initialize the queue provider
   */
  initialize(): Promise<void>;

  /**
   * Publish a message to a queue
   */
  publish(queueName: string, message: QueueMessage, options?: QueueOptions): Promise<void>;

  /**
   * Subscribe to a queue
   */
  subscribe(queueName: string, handler: (message: QueueMessage) => Promise<void>): Promise<void>;

  /**
   * Subscribe to multiple queues
   */
  subscribeToMultiple(queues: string[], handler: (message: QueueMessage) => Promise<void>): Promise<void>;

  /**
   * Acknowledge a message (mark as processed)
   */
  acknowledge(messageId: string): Promise<void>;

  /**
   * Reject a message (mark as failed)
   */
  reject(messageId: string, error?: string): Promise<void>;

  /**
   * Get queue statistics
   */
  getQueueStats(queueName: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }>;

  /**
   * Purge a queue (remove all messages)
   */
  purgeQueue(queueName: string): Promise<void>;

  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;

  /**
   * Close connections
   */
  close(): Promise<void>;
}

export interface QueueProviderConfig {
  type: 'redis' | 'rabbitmq' | 'sqs' | 'memory';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: number;
  vhost?: string;
  ssl?: boolean;
  connectionString?: string;
}
