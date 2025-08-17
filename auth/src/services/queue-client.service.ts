import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { 
  QueueMessage, 
  UserRegistrationData, 
  UserLoginData, 
  UserLogoutData 
} from '@interfaces';

@Injectable()
export class QueueClientService {
  private readonly logger = new Logger(QueueClientService.name);
  private readonly queueServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.queueServiceUrl = this.configService.get<string>('QUEUE_SERVICE_URL', 'http://queue-service:3005');
    
    this.httpClient = axios.create({
      baseURL: this.queueServiceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(`Making queue request to: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Queue service request failed: ${error.message}`);
        throw error;
      }
    );
  }

  /**
   * Publish a message to a queue
   */
  async publishMessage(message: QueueMessage): Promise<string> {
    try {
      const response = await this.httpClient.post('/queue/publish', message);
      return response.data.messageId;
    } catch (error) {
      this.logger.error(`Failed to publish message to queue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish user registration event
   */
  async publishUserRegistrationEvent(userData: UserRegistrationData): Promise<string> {
    const message: QueueMessage = {
      queueName: 'user-events',
      messageType: 'user.registered',
      payload: {
        ...userData,
        timestamp: new Date().toISOString(),
      },
      priority: 'normal',
      metadata: {
        source: 'auth-service',
        version: '1.0',
      },
    };

    return this.publishMessage(message);
  }

  /**
   * Publish user login event
   */
  async publishUserLoginEvent(userData: UserLoginData): Promise<string> {
    const message: QueueMessage = {
      queueName: 'user-events',
      messageType: 'user.logged_in',
      payload: {
        ...userData,
        timestamp: new Date().toISOString(),
      },
      priority: 'low',
      metadata: {
        source: 'auth-service',
        version: '1.0',
      },
    };

    return this.publishMessage(message);
  }

  /**
   * Publish user logout event
   */
  async publishUserLogoutEvent(userData: UserLogoutData): Promise<string> {
    const message: QueueMessage = {
      queueName: 'user-events',
      messageType: 'user.logged_out',
      payload: {
        ...userData,
        timestamp: new Date().toISOString(),
      },
      priority: 'low',
      metadata: {
        source: 'auth-service',
        version: '1.0',
      },
    };

    return this.publishMessage(message);
  }

  /**
   * Health check for queue service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/queue/health');
      return response.data.status === 'healthy';
    } catch (error) {
      this.logger.error(`Queue service health check failed: ${error.message}`);
      return false;
    }
  }
}
