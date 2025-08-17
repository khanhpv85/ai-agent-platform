import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OAuthService } from '@oauth/oauth.service';

@Injectable()
export class ServiceJwtGuard implements CanActivate {
  constructor(private oauthService: OAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const result = await this.oauthService.validateServiceToken(token);
      
      if (!result.valid) {
        throw new UnauthorizedException(result.message || 'Invalid token');
      }

      // Attach service info to request
      request.service = result.user_info;
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
