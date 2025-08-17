import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '@strategies/jwt.strategy';
import { LocalStrategy } from '@strategies/local.strategy';
import { QueueClientService } from '@services/queue-client.service';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, UserSession]),
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
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, QueueClientService],
  exports: [AuthService],
})
export class AuthModule {}
