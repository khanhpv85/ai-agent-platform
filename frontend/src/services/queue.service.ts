import { authClient } from '@configs/http-client';

export interface QueueStats {
  queueName: string;
  stats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    retry: number;
    total: number;
  };
  lastActivity?: string;
  avgProcessingTime?: number;
}

export interface QueueMessage {
  id: string;
  queueName: string;
  messageType: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  retryCount: number;
  maxRetries: number;
  processedAt?: string;
  scheduledAt?: string;
  errorMessage?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface QueueServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class QueueService {
  private baseUrl = 'http://localhost:3005/queue';

  /**
   * Get all queue statistics
   */
  async getQueueStats(): Promise<QueueServiceResponse<QueueStats[]>> {
    try {
      const response = await authClient.get(`${this.baseUrl}/stats`);
      return {
        success: true,
        data: response.data.stats || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch queue statistics'
      };
    }
  }

  /**
   * Get statistics for a specific queue
   */
  async getQueueStatsByName(queueName: string): Promise<QueueServiceResponse<QueueStats>> {
    try {
      const response = await authClient.get(`${this.baseUrl}/stats/${queueName}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch queue statistics'
      };
    }
  }

  /**
   * Get messages from a specific queue
   */
  async getQueueMessages(
    queueName: string, 
    status?: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<QueueServiceResponse<QueueMessage[]>> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await authClient.get(`${this.baseUrl}/messages/${queueName}?${params}`);
      return {
        success: true,
        data: response.data.messages || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch queue messages'
      };
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(messageId: string): Promise<QueueServiceResponse<QueueMessage>> {
    try {
      const response = await authClient.get(`${this.baseUrl}/message/${messageId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch message'
      };
    }
  }

  /**
   * Retry a failed message
   */
  async retryMessage(messageId: string): Promise<QueueServiceResponse<void>> {
    try {
      await authClient.post(`${this.baseUrl}/retry/${messageId}`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retry message'
      };
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<QueueServiceResponse<void>> {
    try {
      await authClient.delete(`${this.baseUrl}/message/${messageId}`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete message'
      };
    }
  }

  /**
   * Purge all messages from a queue
   */
  async purgeQueue(queueName: string): Promise<QueueServiceResponse<void>> {
    try {
      await authClient.delete(`${this.baseUrl}/purge/${queueName}`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to purge queue'
      };
    }
  }

  /**
   * Publish a message to a queue
   */
  async publishMessage(queueName: string, message: {
    messageType: string;
    payload: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    metadata?: any;
  }): Promise<QueueServiceResponse<{ messageId: string }>> {
    try {
      const response = await authClient.post(`${this.baseUrl}/publish`, {
        queueName,
        ...message
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to publish message'
      };
    }
  }

  /**
   * Get queue health status
   */
  async getHealth(): Promise<QueueServiceResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await authClient.get(`${this.baseUrl}/health`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get health status'
      };
    }
  }

  /**
   * Get queue provider information
   */
  async getProviderInfo(): Promise<QueueServiceResponse<{ provider: string; status: string }>> {
    try {
      const response = await authClient.get(`${this.baseUrl}/provider`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get provider information'
      };
    }
  }
}

export const queueService = new QueueService();
