import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus, AgentType } from '@types';
import { NotFoundErrorResponseSchema, BadRequestErrorResponseSchema, PaginationSchema } from './base.schema';

/**
 * Agent Configuration Schema
 */
export class AgentConfigurationSchema {
  @ApiProperty({ description: 'AI model name', example: 'gpt-3.5-turbo', required: false })
  model?: string;

  @ApiProperty({ description: 'Temperature setting', example: 0.7, required: false })
  temperature?: number;

  @ApiProperty({ description: 'Maximum tokens', example: 1000, required: false })
  max_tokens?: number;

  // Additional configuration parameters
  [key: string]: any;
}

/**
 * Agent Schema
 */
export class AgentSchema {
  @ApiProperty({ description: 'Agent ID', example: 'agent-123' })
  id: string;

  @ApiProperty({ description: 'Agent name', example: 'Customer Support Agent' })
  name: string;

  @ApiProperty({ description: 'Agent description', example: 'AI agent for handling customer inquiries', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  company_id: string;

  @ApiProperty({ description: 'User ID who created the agent', example: 'user-123' })
  created_by: string;

  @ApiProperty({ description: 'Agent status', enum: AgentStatus, example: AgentStatus.ACTIVE })
  status: AgentStatus;

  @ApiProperty({ description: 'Agent type', enum: AgentType, example: AgentType.WORKFLOW })
  agent_type: AgentType;

  @ApiProperty({ description: 'Agent configuration', type: AgentConfigurationSchema, nullable: true })
  configuration?: AgentConfigurationSchema;

  @ApiProperty({ description: 'Agent creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Agent last update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

/**
 * Create Agent Request Schema
 */
export class CreateAgentRequestSchema {
  @ApiProperty({ description: 'Agent name', example: 'Customer Support Agent' })
  name: string;

  @ApiProperty({ description: 'Agent description', example: 'AI agent for handling customer inquiries', required: false })
  description?: string;

  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  company_id: string;

  @ApiProperty({ description: 'Agent status', enum: AgentStatus, example: AgentStatus.DRAFT, required: false })
  status?: AgentStatus;

  @ApiProperty({ description: 'Agent type', enum: AgentType, example: AgentType.WORKFLOW, required: false })
  agent_type?: AgentType;

  @ApiProperty({ 
    description: 'Agent configuration',
    type: AgentConfigurationSchema,
    example: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000
    },
    required: false 
  })
  configuration?: AgentConfigurationSchema;
}

/**
 * Update Agent Request Schema
 */
export class UpdateAgentRequestSchema {
  @ApiProperty({ description: 'Agent name', example: 'Updated Agent Name', required: false })
  name?: string;

  @ApiProperty({ description: 'Agent description', example: 'Updated description', required: false })
  description?: string;

  @ApiProperty({ description: 'Agent status', enum: AgentStatus, required: false })
  status?: AgentStatus;

  @ApiProperty({ description: 'Agent type', enum: AgentType, required: false })
  agent_type?: AgentType;

  @ApiProperty({ 
    description: 'Agent configuration',
    type: AgentConfigurationSchema,
    required: false 
  })
  configuration?: AgentConfigurationSchema;
}

/**
 * Get Company Agents Response Schema
 */
export class GetCompanyAgentsResponseSchema {
  @ApiProperty({ description: 'List of agents', type: [AgentSchema] })
  agents: AgentSchema[];

  @ApiProperty({ description: 'Pagination information', type: PaginationSchema })
  pagination: PaginationSchema;
}

/**
 * Get Agent Response Schema
 */
export class GetAgentResponseSchema {
  @ApiProperty({ description: 'Agent details', type: AgentSchema })
  agent: AgentSchema;
}

/**
 * Create Agent Response Schema
 */
export class CreateAgentResponseSchema {
  @ApiProperty({ description: 'Created agent details', type: AgentSchema })
  agent: AgentSchema;

  @ApiProperty({ description: 'Success message', example: 'Agent created successfully' })
  message: string;
}

/**
 * Update Agent Response Schema
 */
export class UpdateAgentResponseSchema {
  @ApiProperty({ description: 'Updated agent details', type: AgentSchema })
  agent: AgentSchema;

  @ApiProperty({ description: 'Success message', example: 'Agent updated successfully' })
  message: string;
}

/**
 * Delete Agent Response Schema
 */
export class DeleteAgentResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Agent deleted successfully' })
  message: string;

  @ApiProperty({ description: 'Deleted agent ID', example: 'agent-123' })
  agent_id: string;
}

/**
 * Agent Error Response Schemas
 */
export class AgentNotFoundErrorResponseSchema extends NotFoundErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 404 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Agent not found' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Not Found' })
  error: string;
}

export class AgentBadRequestErrorResponseSchema extends BadRequestErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Invalid agent data' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Bad Request' })
  error: string;
}

/**
 * Agent Validation Error Response Schema
 */
export class AgentValidationErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Validation failed' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Bad Request' })
  error: string;

  @ApiProperty({ 
    description: 'Validation errors',
    example: [
      'name should not be empty',
      'company_id should not be empty'
    ],
    type: [String]
  })
  errors: string[];
}
