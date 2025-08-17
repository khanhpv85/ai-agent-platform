import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Publish a message to a queue
   */
  @Post('publish')
  @UseGuards(AuthGuard)
  async publishMessage(
    @Body() body: {
      queueName: string;
      messageType: string;
      payload: any;
      priority?: string;
      delay?: number;
      retryCount?: number;
      maxRetries?: number;
      metadata?: any;
    }
  ) {
    const messageId = await this.queueService.publish(
      body.queueName,
      body.messageType,
      body.payload,
      {
        priority: body.priority,
        delay: body.delay,
        retryCount: body.retryCount,
        maxRetries: body.maxRetries,
        metadata: body.metadata,
      }
    );

    return {
      messageId,
      status: 'published',
      queueName: body.queueName,
    };
  }

  /**
   * Get all queue statistics
   */
  @Get('stats')
  @UseGuards(AuthGuard)
  async getAllQueueStats() {
    const stats = await this.queueService.getAllQueueStats();
    
    return {
      stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get queue statistics for specific queue
   */
  @Get('stats/:queueName')
  @UseGuards(AuthGuard)
  async getQueueStats(@Param('queueName') queueName: string) {
    const stats = await this.queueService.getQueueStats(queueName);
    
    return {
      queueName,
      stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get messages from a specific queue
   */
  @Get('messages/:queueName')
  @UseGuards(AuthGuard)
  async getQueueMessages(
    @Param('queueName') queueName: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const messages = await this.queueService.getQueueMessages(
      queueName,
      status,
      parseInt(limit || '50'),
      parseInt(offset || '0')
    );
    
    return {
      queueName,
      messages,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get message by ID
   */
  @Get('message/:messageId')
  @UseGuards(AuthGuard)
  async getMessage(@Param('messageId') messageId: string) {
    const message = await this.queueService.getMessage(messageId);
    
    if (!message) {
      return { error: 'Message not found' };
    }

    return message;
  }

  /**
   * Delete message by ID
   */
  @Delete('message/:messageId')
  @UseGuards(AuthGuard)
  async deleteMessage(@Param('messageId') messageId: string) {
    await this.queueService.deleteMessage(messageId);
    
    return {
      messageId,
      status: 'deleted',
    };
  }

  /**
   * Retry failed message
   */
  @Post('retry/:messageId')
  @UseGuards(AuthGuard)
  async retryMessage(@Param('messageId') messageId: string) {
    await this.queueService.retryMessage(messageId);
    
    return {
      messageId,
      status: 'retried',
    };
  }

  /**
   * Purge queue
   */
  @Delete('purge/:queueName')
  @UseGuards(AuthGuard)
  async purgeQueue(@Param('queueName') queueName: string) {
    await this.queueService.purgeQueue(queueName);
    
    return {
      queueName,
      status: 'purged',
    };
  }

  /**
   * Health check
   */
  @Get('health')
  async healthCheck() {
    const isHealthy = await this.queueService.healthCheck();
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}
