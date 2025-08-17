import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { OAuthTokenResponse, TokenIntrospectionResponse } from '../interfaces/oauth.interface';

@Injectable()
export class QueueOAuthClientService {
  private readonly logger = new Logger(QueueOAuthClientService.name);
  private readonly queueServiceUrl: string;
  private readonly httpClient: AxiosInstance;
  private currentToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {
    this.queueServiceUrl = this.configService.get<string>('QUEUE_SERVICE_URL', 'http://queue-service:3005');
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3000');
    
    this.httpClient = axios.create({
      baseURL: authServiceUrl, // Use auth service for OAuth
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(`Making auth OAuth request to: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Auth OAuth request failed: ${error.message}`);
        throw error;
      }
    );
  }

  /**
   * Get a valid access token using client credentials
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.currentToken && this.isTokenValid()) {
      return this.currentToken;
    }

    // Get client credentials from environment
    const clientId = this.configService.get<string>('QUEUE_OAUTH_CLIENT_ID', 'company_service');
    const clientSecret = this.configService.get<string>('QUEUE_OAUTH_CLIENT_SECRET', 'company_secret_123');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Queue OAuth client credentials not configured');
    }

    try {
      const response = await this.httpClient.post<OAuthTokenResponse>('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'read write subscribe', // Adjust scopes as needed
      });

      this.currentToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      this.logger.debug(`Obtained new auth OAuth token, expires in ${response.data.expires_in} seconds`);
      return this.currentToken;
    } catch (error) {
      this.logger.error(`Failed to obtain auth OAuth token: ${error.message}`);
      throw new UnauthorizedException('Failed to obtain auth OAuth token');
    }
  }

  /**
   * Introspect a token to check its validity
   */
  async introspectToken(token: string): Promise<TokenIntrospectionResponse> {
    try {
      const response = await this.httpClient.post<TokenIntrospectionResponse>('/oauth/introspect', {
        token,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Token introspection failed: ${error.message}`);
      throw new UnauthorizedException('Token introspection failed');
    }
  }

  /**
   * Validate a token by introspecting it
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const introspection = await this.introspectToken(token);
      return introspection.active;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get an HTTP client with automatic token injection
   */
  getAuthenticatedHttpClient(): AxiosInstance {
    const authenticatedClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject token
    authenticatedClient.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    return authenticatedClient;
  }

  /**
   * Make an authenticated request to queue service
   */
  async makeAuthenticatedRequest(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any
  ) {
    const client = this.getAuthenticatedHttpClient();
    const token = await this.getAccessToken();

    try {
      const response = await client.request({
        url,
        method,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Authenticated queue request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribe to queue events with OAuth authentication
   */
  async subscribeToQueue(queueName: string, handler: (message: any) => Promise<void>): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      // In a real implementation, this would be a WebSocket or long-polling connection
      // For now, we'll simulate the subscription with periodic polling
      this.logger.log(`Subscribing to queue ${queueName} with OAuth authentication`);
      
      // Start polling for messages
      this.startPolling(queueName, handler);
      
    } catch (error) {
      this.logger.error(`Failed to subscribe to queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Start polling for messages (simulation)
   */
  private startPolling(queueName: string, handler: (message: any) => Promise<void>): void {
    const pollInterval = setInterval(async () => {
      try {
        // Get queue stats to check for new messages
        const stats = await this.makeAuthenticatedRequest(`/queue/stats/${queueName}`);
        
        if (stats.stats && stats.stats.pending > 0) {
          this.logger.debug(`Found ${stats.stats.pending} pending messages in queue ${queueName}`);
          
          // In a real implementation, you would fetch and process messages here
          // For now, we'll just log the activity
        }
      } catch (error) {
        this.logger.error(`Error in polling for queue ${queueName}:`, error);
      }
    }, 5000); // Poll every 5 seconds

    // Store interval for cleanup (in a real implementation)
    this.logger.log(`Started polling for queue ${queueName}`);
  }

  /**
   * Clear cached token (useful for testing or token refresh issues)
   */
  clearCachedToken(): void {
    this.currentToken = null;
    this.tokenExpiresAt = 0;
    this.logger.debug('Cleared cached auth OAuth token');
  }

  /**
   * Check if current token is still valid
   */
  private isTokenValid(): boolean {
    return this.currentToken && Date.now() < this.tokenExpiresAt - 60000; // 1 minute buffer
  }

  /**
   * Health check for queue service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/queue/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Queue service health check failed: ${error.message}`);
      return false;
    }
  }
}
