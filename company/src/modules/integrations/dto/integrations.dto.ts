import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntegrationType } from '@types';

export class CreateIntegrationDto {
  @ApiProperty({ example: 'Slack Notifications' })
  @IsString()
  name: string;

  @ApiProperty({ enum: IntegrationType, example: IntegrationType.SLACK })
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @ApiProperty({ example: 'company-123' })
  @IsString()
  company_id: string;

  @ApiProperty({ 
    example: {
      webhook_url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
      channel: '#general'
    }
  })
  @IsObject()
  configuration: any;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateIntegrationDto {
  @ApiProperty({ example: 'Updated Integration Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  configuration?: any;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
