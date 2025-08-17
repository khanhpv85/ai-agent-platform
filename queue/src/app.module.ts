import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueMessage } from './entities/queue-message.entity';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'queue_user',
      password: process.env.DB_PASSWORD || 'queue_password123',
      database: process.env.DB_NAME || 'queue_service',
      entities: [QueueMessage],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([QueueMessage]),
  ],
  controllers: [QueueController],
  providers: [QueueService, AuthGuard],
  exports: [QueueService],
})
export class AppModule {}
