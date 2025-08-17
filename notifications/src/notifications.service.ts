import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  async sendNotification(sendNotificationDto: SendNotificationDto, userId: string) {
    // For now, just log the notification
    console.log(`Sending notification to user ${userId}:`, sendNotificationDto);
    
    return {
      success: true,
      message: 'Notification sent successfully',
      notification_id: `notif_${Date.now()}`,
    };
  }
}
