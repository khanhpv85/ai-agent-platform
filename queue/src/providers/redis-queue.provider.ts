import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { QueueProvider, QueueMessage, QueueOptions } from '../interfaces/queue-provider.interface';

@Injectable()
export class RedisQueueProvider implements QueueProvider {
  private readonly logger = new Logger(RedisQueueProvider.name);
  private redis: Redis;
  private subscribers: Map<string, (message: QueueMessage) => Promise<void>> = new Map();
  private isInitialized = false;

  constructor(private config: {
    host: string;
    port: number;
    password?: string;
    database?: number;
  }) {}

  async initialize(): Promise<void> {
    try {
      this.redis = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.database || 0,
      });

      // Test connection
      await this.redis.ping();
      this.isInitialized = true;
      this.logger.log('Redis queue provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis queue provider:', error);
      throw error;
    }
  }

  async publish(queueName: string, message: QueueMessage, options?: QueueOptions): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Redis queue provider not initialized');
    }

    try {
      const messageId = message.id || uuidv4();
      const queueMessage = {
        ...message,
        id: messageId,
        queueName,
        timestamp: Date.now(),
        options,
      };

      // Store message in Redis hash for persistence
      await this.redis.hset(
        `queue:${queueName}:messages`,
        messageId,
        JSON.stringify(queueMessage)
      );

      // Add to priority queue based on priority
      const priority = options?.priority || 'normal';
      const priorityScore = this.getPriorityScore(priority);
      
      await this.redis.zadd(
        `queue:${queueName}:priority`,
        priorityScore,
        messageId
      );

      // Publish to Redis pub/sub for immediate processing
      await this.redis.publish(
        `queue:${queueName}:events`,
        JSON.stringify({ type: 'new_message', messageId, queueName })
      );

      this.logger.debug(`Message ${messageId} published to queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to queue ${queueName}:`, error);
      throw error;
    }
  }

  async subscribe(queueName: string, handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Redis queue provider not initialized');
    }

    try {
      // Store handler for this queue
      this.subscribers.set(queueName, handler);

      // Subscribe to Redis pub/sub channel
      const subscriber = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.database || 0,
      });

      await subscriber.subscribe(`queue:${queueName}:events`);

      subscriber.on('message', async (channel, message) => {
        try {
          const event = JSON.parse(message);
          
          if (event.type === 'new_message') {
            await this.processMessage(queueName, event.messageId, handler);
          }
        } catch (error) {
          this.logger.error(`Error processing message from channel ${channel}:`, error);
        }
      });

      // Also start polling for any existing messages
      this.startPolling(queueName, handler);

      this.logger.log(`Subscribed to queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to queue ${queueName}:`, error);
      throw error;
    }
  }

  async subscribeToMultiple(queues: string[], handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    for (const queueName of queues) {
      await this.subscribe(queueName, handler);
    }
  }

  async acknowledge(messageId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Redis queue provider not initialized');
    }

    try {
      // Remove from processing set
      await this.redis.srem('queue:processing', messageId);
      
      // Add to completed set
      await this.redis.sadd('queue:completed', messageId);
      
      // Update message status in hash
      const messageKey = await this.findMessageKey(messageId);
      if (messageKey) {
        const messageData = await this.redis.hget(messageKey, messageId);
        if (messageData) {
          const message = JSON.parse(messageData);
          message.status = 'completed';
          message.processedAt = new Date().toISOString();
          await this.redis.hset(messageKey, messageId, JSON.stringify(message));
        }
      }

      this.logger.debug(`Message ${messageId} acknowledged`);
    } catch (error) {
      this.logger.error(`Failed to acknowledge message ${messageId}:`, error);
      throw error;
    }
  }

  async reject(messageId: string, error?: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Redis queue provider not initialized');
    }

    try {
      // Remove from processing set
      await this.redis.srem('queue:processing', messageId);
      
      // Add to failed set
      await this.redis.sadd('queue:failed', messageId);
      
      // Update message status in hash
      const messageKey = await this.findMessageKey(messageId);
      if (messageKey) {
        const messageData = await this.redis.hget(messageKey, messageId);
        if (messageData) {
          const message = JSON.parse(messageData);
          message.status = 'failed';
          message.error = error;
          message.processedAt = new Date().toISOString();
          await this.redis.hset(messageKey, messageId, JSON.stringify(message));
        }
      }

      this.logger.debug(`Message ${messageId} rejected: ${error}`);
    } catch (error) {
      this.logger.error(`Failed to reject message ${messageId}:`, error);
      throw error;
    }
  }

  async getQueueStats(queueName: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    if (!this.isInitialized) {
      throw new Error('Redis queue provider not initialized');
    }

    try {
      const [pending, processing, completed, failed] = await Promise.all([
        this.redis.zcard(`queue:${queueName}:priority`),
        this.redis.scard('queue:processing'),
        this.redis.scard('queue:completed'),
        this.redis.scard('queue:failed'),
      ]);

      return {
        pending: pending || 0,
        processing: processing || 0,
        completed: completed || 0,
        failed: failed || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get queue stats for ${queueName}:`, error);
      throw error;
    }
  }

  async purgeQueue(queueName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Redis queue provider not initialized');
    }

    try {
      await Promise.all([
        this.redis.del(`queue:${queueName}:messages`),
        this.redis.del(`queue:${queueName}:priority`),
      ]);

      this.logger.log(`Queue ${queueName} purged`);
    } catch (error) {
      this.logger.error(`Failed to purge queue ${queueName}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isInitialized = false;
      this.logger.log('Redis queue provider closed');
    }
  }

  private async processMessage(queueName: string, messageId: string, handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    try {
      // Check if message is already being processed
      const isProcessing = await this.redis.sismember('queue:processing', messageId);
      if (isProcessing) {
        return;
      }

      // Add to processing set
      await this.redis.sadd('queue:processing', messageId);

      // Get message from hash
      const messageData = await this.redis.hget(`queue:${queueName}:messages`, messageId);
      if (!messageData) {
        await this.redis.srem('queue:processing', messageId);
        return;
      }

      const message = JSON.parse(messageData);
      
      // Process message
      await handler(message);
      
      // Acknowledge message
      await this.acknowledge(messageId);
      
      // Remove from priority queue
      await this.redis.zrem(`queue:${queueName}:priority`, messageId);
      
    } catch (error) {
      this.logger.error(`Error processing message ${messageId}:`, error);
      await this.reject(messageId, error.message);
    }
  }

  private startPolling(queueName: string, handler: (message: QueueMessage) => Promise<void>): void {
    const pollInterval = setInterval(async () => {
      try {
        // Get next message from priority queue
        const messageIds = await this.redis.zrange(`queue:${queueName}:priority`, 0, 0);
        
        if (messageIds.length > 0) {
          const messageId = messageIds[0];
          await this.processMessage(queueName, messageId, handler);
        }
      } catch (error) {
        this.logger.error(`Error in polling for queue ${queueName}:`, error);
      }
    }, 1000); // Poll every second

    // Store interval for cleanup
    this.subscribers.set(`${queueName}:polling`, pollInterval as any);
  }

  private async findMessageKey(messageId: string): Promise<string | null> {
    const keys = await this.redis.keys('queue:*:messages');
    
    for (const key of keys) {
      const exists = await this.redis.hexists(key, messageId);
      if (exists) {
        return key;
      }
    }
    
    return null;
  }

  private getPriorityScore(priority: string): number {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 1;
      case 'high':
        return 2;
      case 'normal':
        return 3;
      case 'low':
        return 4;
      default:
        return 3;
    }
  }
}
