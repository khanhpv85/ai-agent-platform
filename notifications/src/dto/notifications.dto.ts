import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  EMAIL = 'email',
  SLACK = 'slack',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

export class SendNotificationDto {
  @ApiProperty({ example: 'Workflow Completed' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your workflow has been completed successfully.' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.EMAIL })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ 
    example: {
      recipient: 'user@example.com',
      subject: 'Workflow Update'
    },
    required: false 
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
