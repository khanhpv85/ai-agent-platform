import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { JwtStrategy } from '@strategies/jwt.strategy';
import { ClientCredential } from './entities/client-credential.entity';
import { ServiceToken } from './entities/service-token.entity';
import { User } from '@auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientCredential, ServiceToken, User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      signOptions: { 
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        issuer: 'ai-agent-platform',
        audience: 'ai-agent-platform-users',
      },
    }),
  ],
  controllers: [OAuthController],
  providers: [OAuthService, JwtStrategy],
  exports: [OAuthService],
})
export class OAuthModule {}
