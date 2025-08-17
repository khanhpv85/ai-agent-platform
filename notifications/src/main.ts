import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Agent Platform - Notifications Service')
    .setDescription('Notifications service for the AI Agent Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/api/notifications', 'API Gateway Route')
    .addServer('http://localhost:3004', 'Direct Service Access')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Global prefix - removed since nginx handles the routing
  // app.setGlobalPrefix('api');

  const port = process.env.PORT || 3004;
  await app.listen(port);
  
  console.log(`Notifications service is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
