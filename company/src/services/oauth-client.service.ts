import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { OAuthTokenResponse, TokenIntrospectionResponse } from '@interfaces';

@Injectable()
export class OAuthClientService {
  private readonly logger = new Logger(OAuthClientService.name);
  private readonly authServiceUrl: string;
  private readonly httpClient: AxiosInstance;
  private currentToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    
    this.httpClient = axios.create({
      baseURL: this.authServiceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(`Making OAuth request to: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`OAuth request failed: ${error.message}`);
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
    const clientId = this.configService.get<string>('OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>('OAUTH_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('OAuth client credentials not configured');
    }

    try {
      const response = await this.httpClient.post<OAuthTokenResponse>('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'read write', // Adjust scopes as needed
      });

      this.currentToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      this.logger.debug(`Obtained new OAuth token, expires in ${response.data.expires_in} seconds`);
      return this.currentToken;
    } catch (error) {
      this.logger.error(`Failed to obtain OAuth token: ${error.message}`);
      throw new UnauthorizedException('Failed to obtain OAuth token');
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
   * Make an authenticated request to another service
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
      this.logger.error(`Authenticated request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear cached token (useful for testing or token refresh issues)
   */
  clearCachedToken(): void {
    this.currentToken = null;
    this.tokenExpiresAt = 0;
    this.logger.debug('Cleared cached OAuth token');
  }

  /**
   * Check if current token is still valid
   */
  private isTokenValid(): boolean {
    return this.currentToken && Date.now() < this.tokenExpiresAt - 60000; // 1 minute buffer
  }

  /**
   * Health check for OAuth service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`OAuth service health check failed: ${error.message}`);
      return false;
    }
  }
}
