import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { QueueProvider, QueueMessage, QueueOptions } from '../interfaces/queue-provider.interface';

@Injectable()
export class RabbitMQQueueProvider implements QueueProvider {
  private readonly logger = new Logger(RabbitMQQueueProvider.name);
  private connection: any;
  private channel: any;
  private isInitialized = false;
  private consumers: Map<string, any> = new Map();

  constructor(private config: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    vhost?: string;
  }) {}

  async initialize(): Promise<void> {
    try {
      const url = `amqp://${this.config.username || 'guest'}:${this.config.password || 'guest'}@${this.config.host}:${this.config.port}/${this.config.vhost || '/'}`;
      
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Enable publisher confirms
      await this.channel.confirmSelect();
      
      this.isInitialized = true;
      this.logger.log('RabbitMQ queue provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ queue provider:', error);
      throw error;
    }
  }

  async publish(queueName: string, message: QueueMessage, options?: QueueOptions): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('RabbitMQ queue provider not initialized');
    }

    try {
      // Ensure queue exists
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-max-priority': 10, // Enable priority queue
        }
      });

      const messageId = message.id || uuidv4();
      const priority = this.getPriorityNumber(options?.priority || 'normal');
      
      const messageBuffer = Buffer.from(JSON.stringify({
        ...message,
        id: messageId,
        queueName,
        timestamp: Date.now(),
        options,
      }));

      const published = await this.channel.sendToQueue(
        queueName,
        messageBuffer,
        {
          persistent: true,
          priority,
          messageId,
          timestamp: Date.now(),
          headers: {
            'x-retry-count': options?.retryCount || 0,
            'x-max-retries': options?.maxRetries || 3,
            ...options?.metadata,
          },
        }
      );

      if (published) {
        this.logger.debug(`Message ${messageId} published to queue ${queueName}`);
      } else {
        throw new Error('Failed to publish message to queue');
      }
    } catch (error) {
      this.logger.error(`Failed to publish message to queue ${queueName}:`, error);
      throw error;
    }
  }

  async subscribe(queueName: string, handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('RabbitMQ queue provider not initialized');
    }

    try {
      // Ensure queue exists
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-max-priority': 10,
        }
      });

      // Set up consumer
      const consumer = await this.channel.consume(
        queueName,
        async (msg) => {
          if (!msg) {
            return;
          }

          try {
            const message: QueueMessage = JSON.parse(msg.content.toString());
            
            // Process message
            await handler(message);
            
            // Acknowledge message
            this.channel.ack(msg);
            
            this.logger.debug(`Message ${message.id} processed successfully`);
          } catch (error) {
            this.logger.error(`Error processing message:`, error);
            
            // Check retry count
            const retryCount = msg.properties.headers?.['x-retry-count'] || 0;
            const maxRetries = msg.properties.headers?.['x-max-retries'] || 3;
            
            if (retryCount < maxRetries) {
              // Reject and requeue for retry
              this.channel.nack(msg, false, true);
              
              // Update retry count in headers
              msg.properties.headers['x-retry-count'] = retryCount + 1;
            } else {
              // Reject without requeue (move to dead letter queue)
              this.channel.nack(msg, false, false);
            }
          }
        },
        {
          noAck: false,
        }
      );

      this.consumers.set(queueName, consumer);
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
    // Acknowledgment is handled in the consumer callback
    this.logger.debug(`Message ${messageId} acknowledged`);
  }

  async reject(messageId: string, error?: string): Promise<void> {
    // Rejection is handled in the consumer callback
    this.logger.debug(`Message ${messageId} rejected: ${error}`);
  }

  async getQueueStats(queueName: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    if (!this.isInitialized) {
      throw new Error('RabbitMQ queue provider not initialized');
    }

    try {
      // Ensure queue exists
      await this.channel.assertQueue(queueName, { durable: true });
      
      // Get queue info
      const queueInfo = await this.channel.checkQueue(queueName);
      
      return {
        pending: queueInfo.messageCount || 0,
        processing: 0, // RabbitMQ doesn't track processing state
        completed: 0, // Would need separate tracking
        failed: 0, // Would need dead letter queue monitoring
      };
    } catch (error) {
      this.logger.error(`Failed to get queue stats for ${queueName}:`, error);
      throw error;
    }
  }

  async purgeQueue(queueName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('RabbitMQ queue provider not initialized');
    }

    try {
      await this.channel.purgeQueue(queueName);
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
      // Check if connection and channel exist
      if (!this.connection || !this.channel) {
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('RabbitMQ health check failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      
      if (this.connection) {
        await this.connection.close();
      }
      
      this.isInitialized = false;
      this.logger.log('RabbitMQ queue provider closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  private getPriorityNumber(priority: string): number {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 1;
      case 'high':
        return 3;
      case 'normal':
        return 5;
      case 'low':
        return 7;
      default:
        return 5;
    }
  }
}
