import { IsString, IsOptional, IsEnum, IsObject, IsUUID, ValidateNested, IsNumber, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AgentStatus, AgentType } from '../../../types/agent.types';

// LLM Configuration DTO
export class LLMConfigDto {
  @ApiProperty({ example: 'openai', description: 'LLM provider' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'gpt-3.5-turbo', description: 'Model name' })
  @IsString()
  model: string;

  @ApiProperty({ example: 0.7, description: 'Temperature for response generation' })
  temperature: number;

  @ApiProperty({ example: 1000, description: 'Maximum tokens for response' })
  max_tokens: number;

  @ApiProperty({ example: 1, description: 'Top-p sampling parameter' })
  top_p: number;

  @ApiProperty({ example: 0, description: 'Frequency penalty' })
  frequency_penalty: number;

  @ApiProperty({ example: 0, description: 'Presence penalty' })
  presence_penalty: number;

  @ApiProperty({ example: 'You are a helpful assistant', description: 'System prompt', required: false })
  @IsOptional()
  @IsString()
  system_prompt?: string;

  @ApiProperty({ example: {}, description: 'Custom headers', required: false })
  @IsOptional()
  @IsObject()
  custom_headers?: any;
}

// Partial LLM Configuration DTO for updates
export class UpdateLLMConfigDto {
  @ApiProperty({ example: 'openai', description: 'LLM provider', required: false })
  @IsOptional() @IsString() provider?: string;

  @ApiProperty({ example: 'gpt-3.5-turbo', description: 'LLM model', required: false })
  @IsOptional() @IsString() model?: string;

  @ApiProperty({ example: 0.7, description: 'Temperature (0-2)', required: false })
  @IsOptional() @IsNumber() @Min(0) @Max(2) temperature?: number;

  @ApiProperty({ example: 1000, description: 'Maximum tokens', required: false })
  @IsOptional() @IsNumber() @Min(1) max_tokens?: number;

  @ApiProperty({ example: 1, description: 'Top P (0-1)', required: false })
  @IsOptional() @IsNumber() @Min(0) @Max(1) top_p?: number;

  @ApiProperty({ example: 0, description: 'Frequency penalty (-2 to 2)', required: false })
  @IsOptional() @IsNumber() @Min(-2) @Max(2) frequency_penalty?: number;

  @ApiProperty({ example: 0, description: 'Presence penalty (-2 to 2)', required: false })
  @IsOptional() @IsNumber() @Min(-2) @Max(2) presence_penalty?: number;

  @ApiProperty({ example: 'You are a helpful AI assistant.', description: 'System prompt', required: false })
  @IsOptional() @IsString() system_prompt?: string;

  @ApiProperty({ example: { 'Authorization': 'Bearer token' }, description: 'Custom headers', required: false })
  @IsOptional() @IsObject() custom_headers?: Record<string, string>;
}

export class UpdateKnowledgeBaseConfigDto {
  @ApiProperty({ 
    example: ['kb-001', 'kb-002'], 
    description: 'Array of knowledge base IDs to associate with the agent',
    type: [String],
    required: true 
  })
  @IsArray()
  @IsString({ each: true })
  knowledge_bases: string[];
}

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
      llm: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000
      }
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
