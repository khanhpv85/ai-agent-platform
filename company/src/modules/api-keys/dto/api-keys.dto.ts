import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiKeyStatus, ApiKeyPermission } from '@types';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production API Key', description: 'Name for the API key' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'company-123', description: 'Company ID' })
  @IsUUID()
  company_id: string;

  @ApiProperty({ 
    example: [ApiKeyPermission.READ, ApiKeyPermission.WRITE], 
    description: 'Permissions for the API key',
    enum: ApiKeyPermission,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ApiKeyPermission, { each: true })
  permissions?: ApiKeyPermission[];

  @ApiProperty({ 
    example: '2024-12-31T23:59:59Z', 
    description: 'Expiration date for the API key',
    required: false
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateApiKeyDto {
  @ApiProperty({ example: 'Updated API Key Name', description: 'New name for the API key', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    example: ApiKeyStatus.ACTIVE, 
    description: 'Status of the API key',
    enum: ApiKeyStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(ApiKeyStatus)
  status?: ApiKeyStatus;

  @ApiProperty({ 
    example: [ApiKeyPermission.READ, ApiKeyPermission.WRITE], 
    description: 'Permissions for the API key',
    enum: ApiKeyPermission,
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ApiKeyPermission, { each: true })
  permissions?: ApiKeyPermission[];

  @ApiProperty({ 
    example: '2024-12-31T23:59:59Z', 
    description: 'Expiration date for the API key',
    required: false
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class ValidateApiKeyDto {
  @ApiProperty({ example: 'ak_1234567890abcdef', description: 'API key to validate' })
  @IsString()
  api_key: string;
}

export class ApiKeyResponseDto {
  @ApiProperty({ example: 'key-123', description: 'API key ID' })
  id: string;

  @ApiProperty({ example: 'Production API Key', description: 'API key name' })
  name: string;

  @ApiProperty({ example: 'ak_1234...', description: 'API key prefix (masked)' })
  prefix: string;

  @ApiProperty({ example: ApiKeyStatus.ACTIVE, description: 'API key status', enum: ApiKeyStatus })
  status: ApiKeyStatus;

  @ApiProperty({ 
    example: [ApiKeyPermission.READ, ApiKeyPermission.WRITE], 
    description: 'API key permissions',
    enum: ApiKeyPermission,
    isArray: true
  })
  permissions: ApiKeyPermission[];

  @ApiProperty({ example: '2024-12-31T23:59:59Z', description: 'Expiration date', required: false })
  expires_at?: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Last used timestamp', required: false })
  last_used_at?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Last update timestamp' })
  updated_at: Date;
}

export class CreateApiKeyResponseDto extends ApiKeyResponseDto {
  @ApiProperty({ example: 'ak_1234567890abcdef', description: 'Full API key (only shown once)' })
  key: string;
}
