import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AuthUser } from '../interfaces/auth.interface';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly authServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    
    this.httpClient = axios.create({
      baseURL: this.authServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use((config) => {
      this.logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Auth service request failed: ${error.message}`);
        throw error;
      }
    );
  }

  /**
   * Validate JWT token with auth service
   */
  async validateToken(token: string): Promise<AuthUser> {
    try {
      const response = await this.httpClient.post('/auth/validate-token', {
        token,
      });

      if (response.data.success && response.data.valid) {
        const userInfo = response.data.user_info;
        // Map user_id to id to match AuthUser interface
        return {
          id: userInfo.user_id,
          email: userInfo.email,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          role: userInfo.role,
          is_active: userInfo.is_active,
        };
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  /**
   * Get user auth status from auth service
   */
  async getUserAuthStatus(userId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/auth/user-auth-status/${userId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user auth status: ${error.message}`);
      throw new UnauthorizedException('Failed to get user auth status');
    }
  }

  /**
   * Health check for auth service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Auth service health check failed: ${error.message}`);
      return false;
    }
  }
}
