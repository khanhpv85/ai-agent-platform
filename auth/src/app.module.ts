import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@auth/auth.module';
import { OAuthModule } from '@oauth/oauth.module';
import { User } from '@auth/entities/user.entity';
import { RefreshToken } from '@auth/entities/refresh-token.entity';
import { UserSession } from '@auth/entities/user-session.entity';
import { ClientCredential } from '@oauth/entities/client-credential.entity';
import { ServiceToken } from '@oauth/entities/service-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Auth database connection only
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.AUTH_DB_HOST || 'db',
      port: parseInt(process.env.AUTH_DB_PORT) || 3306,
      username: process.env.AUTH_DB_USER || 'ai_user',
      password: process.env.AUTH_DB_PASSWORD || 'ai_password123',
      database: process.env.AUTH_DB_NAME || 'auth_service',
      entities: [User, RefreshToken, UserSession, ClientCredential, ServiceToken],
      synchronize: false, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    OAuthModule,
  ],
  providers: [],
})
export class AppModule {}
