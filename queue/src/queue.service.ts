import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { QueueMessage as QueueMessageEntity, MessageStatus, MessagePriority } from './entities/queue-message.entity';
import { QueueProvider, QueueMessage, QueueOptions } from './interfaces/queue-provider.interface';
import { RedisQueueProvider } from './providers/redis-queue.provider';
import { RabbitMQQueueProvider } from './providers/rabbitmq-queue.provider';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private provider: QueueProvider;
  private isInitialized = false;

  constructor(
    @InjectRepository(QueueMessageEntity)
    private queueMessageRepository: Repository<QueueMessageEntity>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    if (this.provider) {
      await this.provider.close();
    }
  }

  private async initialize(): Promise<void> {
    try {
      const providerType = this.configService.get<string>('QUEUE_PROVIDER', 'redis');
      
      switch (providerType.toLowerCase()) {
        case 'redis':
          this.provider = new RedisQueueProvider({
            host: this.configService.get<string>('REDIS_HOST', 'redis'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD'),
            database: this.configService.get<number>('REDIS_DB', 0),
          });
          break;
          
        case 'rabbitmq':
          this.provider = new RabbitMQQueueProvider({
            host: this.configService.get<string>('RABBITMQ_HOST', 'rabbitmq'),
            port: this.configService.get<number>('RABBITMQ_PORT', 5672),
            username: this.configService.get<string>('RABBITMQ_USERNAME', 'guest'),
            password: this.configService.get<string>('RABBITMQ_PASSWORD', 'guest'),
            vhost: this.configService.get<string>('RABBITMQ_VHOST', '/'),
          });
          break;
          
        default:
          throw new Error(`Unsupported queue provider: ${providerType}`);
      }

      await this.provider.initialize();
      this.isInitialized = true;
      
      this.logger.log(`Queue service initialized with ${providerType} provider`);
    } catch (error) {
      this.logger.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  /**
   * Publish a message to a queue
   */
  async publish(queueName: string, messageType: string, payload: any, options?: QueueOptions): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized');
    }

    const messageId = uuidv4();
    
    try {
      // Create queue message entity
      const queueMessage = this.queueMessageRepository.create({
        id: messageId,
        queue_name: queueName,
        message_type: messageType,
        payload,
        priority: this.mapPriority(options?.priority),
        retry_count: 0,
        max_retries: options?.maxRetries || 3,
        metadata: options?.metadata,
        status: MessageStatus.PENDING,
      });

      await this.queueMessageRepository.save(queueMessage);

      // Publish to queue provider
      await this.provider.publish(queueName, {
        id: messageId,
        queueName,
        messageType,
        payload,
        priority: options?.priority,
        metadata: options?.metadata,
      }, options);

      this.logger.debug(`Message ${messageId} published to queue ${queueName}`);
      return messageId;
    } catch (error) {
      this.logger.error(`Failed to publish message to queue ${queueName}:`, error);
      
      // Update message status to failed
      await this.queueMessageRepository.update(messageId, {
        status: MessageStatus.FAILED,
        error_message: error.message,
      });
      
      throw error;
    }
  }

  /**
   * Subscribe to a queue
   */
  async subscribe(queueName: string, handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized');
    }

    await this.provider.subscribe(queueName, async (message) => {
      try {
        // Update message status to processing
        await this.queueMessageRepository.update(message.id, {
          status: MessageStatus.PROCESSING,
        });

        // Process message
        await handler(message);

        // Update message status to completed
        await this.queueMessageRepository.update(message.id, {
          status: MessageStatus.COMPLETED,
          processed_at: new Date(),
        });

        // Acknowledge message
        await this.provider.acknowledge(message.id);

        this.logger.debug(`Message ${message.id} processed successfully`);
      } catch (error) {
        this.logger.error(`Error processing message ${message.id}:`, error);

        // Update message status to failed
        await this.queueMessageRepository.update(message.id, {
          status: MessageStatus.FAILED,
          error_message: error.message,
          processed_at: new Date(),
        });

        // Reject message
        await this.provider.reject(message.id, error.message);
      }
    });
  }

  /**
   * Subscribe to multiple queues
   */
  async subscribeToMultiple(queues: string[], handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    await this.provider.subscribeToMultiple(queues, async (message) => {
      try {
        // Update message status to processing
        await this.queueMessageRepository.update(message.id, {
          status: MessageStatus.PROCESSING,
        });

        // Process message
        await handler(message);

        // Update message status to completed
        await this.queueMessageRepository.update(message.id, {
          status: MessageStatus.COMPLETED,
          processed_at: new Date(),
        });

        // Acknowledge message
        await this.provider.acknowledge(message.id);

        this.logger.debug(`Message ${message.id} processed successfully`);
      } catch (error) {
        this.logger.error(`Error processing message ${message.id}:`, error);

        // Update message status to failed
        await this.queueMessageRepository.update(message.id, {
          status: MessageStatus.FAILED,
          error_message: error.message,
          processed_at: new Date(),
        });

        // Reject message
        await this.provider.reject(message.id, error.message);
      }
    });
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<Array<{
    queueName: string;
    stats: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
      retry: number;
      total: number;
    };
  }>> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized');
    }

    const dbStats = await this.queueMessageRepository
      .createQueryBuilder('message')
      .select('message.queue_name', 'queueName')
      .addSelect('message.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.queue_name')
      .addGroupBy('message.status')
      .getRawMany();

    // Group by queue name
    const queueStatsMap = new Map<string, any>();
    
    dbStats.forEach((stat: any) => {
      const queueName = stat.queueName;
      if (!queueStatsMap.has(queueName)) {
        queueStatsMap.set(queueName, {
          queueName,
          stats: {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            retry: 0,
            total: 0,
          },
        });
      }
      
      const queueStats = queueStatsMap.get(queueName);
      const count = parseInt(stat.count);
      queueStats.stats[stat.status] = count;
      queueStats.stats.total += count;
    });

    return Array.from(queueStatsMap.values());
  }

  /**
   * Get queue statistics for specific queue
   */
  async getQueueStats(queueName: string): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized');
    }

    const [dbStats, providerStats] = await Promise.all([
      this.queueMessageRepository
        .createQueryBuilder('message')
        .select('message.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('message.queue_name = :queueName', { queueName })
        .groupBy('message.status')
        .getRawMany(),
      this.provider.getQueueStats(queueName),
    ]);

    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    // Combine database and provider stats
    dbStats.forEach((stat: any) => {
      stats[stat.status] = parseInt(stat.count);
    });

    // Override with provider stats for pending
    stats.pending = providerStats.pending;

    return stats;
  }

  /**
   * Get messages from a specific queue
   */
  async getQueueMessages(
    queueName: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<QueueMessageEntity[]> {
    const queryBuilder = this.queueMessageRepository
      .createQueryBuilder('message')
      .where('message.queue_name = :queueName', { queueName })
      .orderBy('message.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    if (status && status !== 'all') {
      queryBuilder.andWhere('message.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  /**
   * Get message by ID
   */
  async getMessage(messageId: string): Promise<QueueMessageEntity | null> {
    return this.queueMessageRepository.findOne({
      where: { id: messageId },
    });
  }

  /**
   * Delete message by ID
   */
  async deleteMessage(messageId: string): Promise<void> {
    const result = await this.queueMessageRepository.delete({ id: messageId });
    
    if (result.affected === 0) {
      throw new Error('Message not found');
    }

    this.logger.log(`Message ${messageId} deleted`);
  }

  /**
   * Retry failed message
   */
  async retryMessage(messageId: string): Promise<void> {
    const message = await this.queueMessageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.status !== MessageStatus.FAILED) {
      throw new Error('Message is not in failed status');
    }

    if (!message.isRetryable()) {
      throw new Error('Message has exceeded maximum retry attempts');
    }

    // Increment retry count and reset status
    message.incrementRetry();
    await this.queueMessageRepository.save(message);

    // Republish to queue
    await this.provider.publish(message.queue_name, {
      id: message.id,
      queueName: message.queue_name,
      messageType: message.message_type,
      payload: message.payload,
      metadata: message.metadata,
    }, {
      retryCount: message.retry_count,
      maxRetries: message.max_retries,
    });

    this.logger.log(`Message ${messageId} retried`);
  }

  /**
   * Purge queue
   */
  async purgeQueue(queueName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Queue service not initialized');
    }

    await Promise.all([
      this.provider.purgeQueue(queueName),
      this.queueMessageRepository.delete({ queue_name: queueName }),
    ]);

    this.logger.log(`Queue ${queueName} purged`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    return this.provider.healthCheck();
  }

  private mapPriority(priority?: string): MessagePriority {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return MessagePriority.URGENT;
      case 'high':
        return MessagePriority.HIGH;
      case 'low':
        return MessagePriority.LOW;
      default:
        return MessagePriority.NORMAL;
    }
  }
}
