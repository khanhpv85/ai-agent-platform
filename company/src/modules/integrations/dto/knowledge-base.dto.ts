import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SourceType } from '../entities/knowledge-base.entity';

export class CreateKnowledgeBaseDto {
  @ApiProperty({ example: 'Company Documentation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Internal company policies and procedures', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'company-123' })
  @IsString()
  company_id: string;

  @ApiProperty({ enum: SourceType, example: SourceType.DOCUMENT })
  @IsEnum(SourceType)
  source_type: SourceType;

  @ApiProperty({ 
    example: {
      path: '/docs/company',
      endpoint: 'https://api.example.com/data',
      table: 'support_articles'
    },
    required: false 
  })
  @IsOptional()
  @IsObject()
  source_config?: any;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateKnowledgeBaseDto {
  @ApiProperty({ example: 'Updated Knowledge Base Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SourceType, required: false })
  @IsOptional()
  @IsEnum(SourceType)
  source_type?: SourceType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  source_config?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
