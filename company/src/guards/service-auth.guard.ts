import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthClientService } from '@services/auth-client.service';
import { OAuthClientService } from '@services/oauth-client.service';

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(
    private authClientService: AuthClientService,
    private oauthClientService: OAuthClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // First, try to validate as a service token (OAuth)
      const serviceValidation = await this.oauthClientService.introspectToken(token);
      
      if (serviceValidation.active) {
        // This is a valid service token
        request.service = {
          client_id: serviceValidation.client_id,
          scopes: serviceValidation.scope?.split(' ') || [],
          type: 'service',
        };
        return true;
      }

      // If not a service token, try to validate as a user token
      const user = await this.authClientService.validateToken(token);
      request.user = user;
      request.service = null;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
