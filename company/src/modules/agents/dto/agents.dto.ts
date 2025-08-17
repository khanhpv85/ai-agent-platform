import { IsString, IsOptional, IsEnum, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus, AgentType } from '../../../types/agent.types';

export class CreateAgentDto {
  @ApiProperty({ example: 'Customer Support Agent' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'AI agent for handling customer inquiries', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'company-123' })
  @IsString()
  company_id: string;

  @ApiProperty({ enum: AgentStatus, default: AgentStatus.DRAFT })
  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @ApiProperty({ enum: AgentType, default: AgentType.WORKFLOW })
  @IsOptional()
  @IsEnum(AgentType)
  agent_type?: AgentType;

  @ApiProperty({ 
    example: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000
    },
    required: false 
  })
  @IsOptional()
  @IsObject()
  configuration?: any;
}

export class UpdateAgentDto {
  @ApiProperty({ example: 'Updated Agent Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AgentStatus, required: false })
  @IsOptional()
  @IsEnum(AgentStatus)
  status?: AgentStatus;

  @ApiProperty({ enum: AgentType, required: false })
  @IsOptional()
  @IsEnum(AgentType)
  agent_type?: AgentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  configuration?: any;
}
