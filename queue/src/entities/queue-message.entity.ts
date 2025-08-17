import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry'
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('queue_messages')
export class QueueMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  queue_name: string;

  @Column()
  message_type: string;

  @Column('json')
  payload: any;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.PENDING
  })
  @Index()
  status: MessageStatus;

  @Column({
    type: 'enum',
    enum: MessagePriority,
    default: MessagePriority.NORMAL
  })
  priority: MessagePriority;

  @Column({ default: 0 })
  retry_count: number;

  @Column({ default: 3 })
  max_retries: number;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  // Helper methods
  isRetryable(): boolean {
    return this.retry_count < this.max_retries;
  }

  incrementRetry(): void {
    this.retry_count += 1;
    this.status = MessageStatus.RETRY;
  }

  markAsProcessing(): void {
    this.status = MessageStatus.PROCESSING;
  }

  markAsCompleted(): void {
    this.status = MessageStatus.COMPLETED;
    this.processed_at = new Date();
  }

  markAsFailed(error: string): void {
    this.status = MessageStatus.FAILED;
    this.error_message = error;
    this.processed_at = new Date();
  }
}
