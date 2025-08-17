import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3000');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Validate token through auth service
      const response = await axios.post(`${this.authServiceUrl}/auth/validate-token`, {
        token,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (response.data.valid) {
        // Attach user/service info to request
        request.user = response.data.user;
        request.service = response.data.service;
        return true;
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication service unavailable');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
