import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for direct service communication
  app.enableCors({
    origin: [
      'http://localhost:3000', // Frontend
      'http://localhost:3001', // Auth service
      'http://localhost:3002', // Company service (includes agents)
      'http://localhost:3004', // Notifications service
      'http://company:3000',   // Company service (internal)
      'http://auth-service:3000',   // Auth service (internal)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Agent Platform - Auth Service')
    .setDescription('Authentication and authorization service for the AI Agent Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3001', 'Direct Service Access')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global prefix - removed since nginx handles the routing
  // app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Auth service is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
