import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/notifications.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiOperation({ 
    summary: 'Send notification',
    description: 'Send a notification through various channels (email, Slack, SMS, webhook). This endpoint supports multiple notification types and providers.',
    tags: ['Notifications']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Notification sent successfully' },
        notification_id: { type: 'string', example: 'notif-123' },
        channel: { type: 'string', example: 'email' },
        recipient: { type: 'string', example: 'user@example.com' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid notification configuration',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid notification configuration' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto, @Request() req) {
    return this.notificationsService.sendNotification(sendNotificationDto, req.user.id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return { status: 'healthy', service: 'notifications-service' };
  }
}
