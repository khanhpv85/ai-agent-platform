import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStatus, ExecutionStatus } from '@types';
import { NotFoundErrorResponseSchema, BadRequestErrorResponseSchema, PaginationSchema } from './base.schema';

/**
 * Workflow Step Schema
 */
export class WorkflowStepSchema {
  @ApiProperty({ description: 'Step type', example: 'ai_reasoning' })
  type: string;

  @ApiProperty({ description: 'Agent ID for this step', example: 'agent-123' })
  agent_id: string;

  @ApiProperty({ description: 'Step configuration', example: { model: 'gpt-3.5-turbo' } })
  config: any;

  @ApiProperty({ description: 'Step order', example: 1, required: false })
  order?: number;

  @ApiProperty({ description: 'Step name', example: 'AI Analysis', required: false })
  name?: string;
}

/**
 * Workflow Trigger Schema
 */
export class WorkflowTriggerSchema {
  @ApiProperty({ description: 'Webhook URL', example: 'https://example.com/webhook', required: false })
  webhook?: string;

  @ApiProperty({ description: 'Cron schedule', example: '0 0 * * *', required: false })
  schedule?: string;

  @ApiProperty({ description: 'Manual trigger enabled', example: true, required: false })
  manual?: boolean;

  // Additional trigger configuration
  [key: string]: any;
}

/**
 * Workflow Schema
 */
export class WorkflowSchema {
  @ApiProperty({ description: 'Workflow ID', example: 'workflow-123' })
  id: string;

  @ApiProperty({ description: 'Workflow name', example: 'Data Processing Workflow' })
  name: string;

  @ApiProperty({ description: 'Workflow description', example: 'Process and analyze data using AI', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  company_id: string;

  @ApiProperty({ description: 'User ID who created the workflow', example: 'user-123' })
  created_by: string;

  @ApiProperty({ description: 'Workflow status', enum: WorkflowStatus, example: WorkflowStatus.ACTIVE })
  status: WorkflowStatus;

  @ApiProperty({ description: 'Workflow steps', type: [WorkflowStepSchema] })
  steps: WorkflowStepSchema[];

  @ApiProperty({ description: 'Workflow triggers', type: WorkflowTriggerSchema, nullable: true })
  triggers?: WorkflowTriggerSchema;

  @ApiProperty({ description: 'Workflow creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Workflow last update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

/**
 * Workflow Execution Schema
 */
export class WorkflowExecutionSchema {
  @ApiProperty({ description: 'Execution ID', example: 'exec-123' })
  id: string;

  @ApiProperty({ description: 'Workflow ID', example: 'workflow-123' })
  workflow_id: string;

  @ApiProperty({ description: 'Execution status', enum: ExecutionStatus, example: ExecutionStatus.COMPLETED })
  status: ExecutionStatus;

  @ApiProperty({ description: 'Input data', example: { text: 'Sample input' }, nullable: true })
  input_data?: any;

  @ApiProperty({ description: 'Output data', example: { result: 'Processed data' }, nullable: true })
  output_data?: any;

  @ApiProperty({ description: 'Error message', example: 'Processing failed', nullable: true })
  error_message?: string;

  @ApiProperty({ description: 'Execution start timestamp', example: '2024-01-01T00:00:00Z', nullable: true })
  started_at?: string;

  @ApiProperty({ description: 'Execution completion timestamp', example: '2024-01-01T00:01:00Z', nullable: true })
  completed_at?: string;

  @ApiProperty({ description: 'Execution creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;
}

/**
 * Create Workflow Request Schema
 */
export class CreateWorkflowRequestSchema {
  @ApiProperty({ description: 'Workflow name', example: 'Data Processing Workflow' })
  name: string;

  @ApiProperty({ description: 'Workflow description', example: 'Process and analyze data using AI', required: false })
  description?: string;

  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  company_id: string;

  @ApiProperty({ description: 'Workflow status', enum: WorkflowStatus, example: WorkflowStatus.DRAFT, required: false })
  status?: WorkflowStatus;

  @ApiProperty({ 
    description: 'Workflow steps',
    type: [WorkflowStepSchema],
    example: [
      {
        type: 'ai_reasoning',
        config: { model: 'gpt-3.5-turbo' }
      },
      {
        type: 'api_call',
        config: { 
          method: 'POST',
          url: 'https://api.example.com/process',
          headers: { 'Content-Type': 'application/json' }
        }
      }
    ]
  })
  steps: WorkflowStepSchema[];

  @ApiProperty({ 
    description: 'Workflow triggers',
    type: WorkflowTriggerSchema,
    example: {
      webhook: 'https://example.com/webhook',
      schedule: '0 0 * * *'
    },
    required: false 
  })
  triggers?: WorkflowTriggerSchema;
}

/**
 * Update Workflow Request Schema
 */
export class UpdateWorkflowRequestSchema {
  @ApiProperty({ description: 'Workflow name', example: 'Updated Workflow Name', required: false })
  name?: string;

  @ApiProperty({ description: 'Workflow description', example: 'Updated description', required: false })
  description?: string;

  @ApiProperty({ description: 'Workflow status', enum: WorkflowStatus, required: false })
  status?: WorkflowStatus;

  @ApiProperty({ 
    description: 'Workflow steps',
    type: [WorkflowStepSchema],
    required: false 
  })
  steps?: WorkflowStepSchema[];

  @ApiProperty({ 
    description: 'Workflow triggers',
    type: WorkflowTriggerSchema,
    required: false 
  })
  triggers?: WorkflowTriggerSchema;
}

/**
 * Execute Workflow Request Schema
 */
export class ExecuteWorkflowRequestSchema {
  @ApiProperty({ 
    description: 'Input data for workflow execution',
    example: {
      text: 'Sample text to process',
      parameters: { max_length: 100 }
    }
  })
  input_data: any;
}

/**
 * Get Company Workflows Response Schema
 */
export class GetCompanyWorkflowsResponseSchema {
  @ApiProperty({ description: 'List of workflows', type: [WorkflowSchema] })
  workflows: WorkflowSchema[];

  @ApiProperty({ description: 'Pagination information', type: PaginationSchema })
  pagination: PaginationSchema;
}

/**
 * Get Workflow Response Schema
 */
export class GetWorkflowResponseSchema {
  @ApiProperty({ description: 'Workflow details', type: WorkflowSchema })
  workflow: WorkflowSchema;
}

/**
 * Create Workflow Response Schema
 */
export class CreateWorkflowResponseSchema {
  @ApiProperty({ description: 'Created workflow details', type: WorkflowSchema })
  workflow: WorkflowSchema;

  @ApiProperty({ description: 'Success message', example: 'Workflow created successfully' })
  message: string;
}

/**
 * Update Workflow Response Schema
 */
export class UpdateWorkflowResponseSchema {
  @ApiProperty({ description: 'Updated workflow details', type: WorkflowSchema })
  workflow: WorkflowSchema;

  @ApiProperty({ description: 'Success message', example: 'Workflow updated successfully' })
  message: string;
}

/**
 * Delete Workflow Response Schema
 */
export class DeleteWorkflowResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Workflow deleted successfully' })
  message: string;

  @ApiProperty({ description: 'Deleted workflow ID', example: 'workflow-123' })
  workflow_id: string;
}

/**
 * Execute Workflow Response Schema
 */
export class ExecuteWorkflowResponseSchema {
  @ApiProperty({ description: 'Execution ID', example: 'exec-123' })
  execution_id: string;

  @ApiProperty({ description: 'Workflow ID', example: 'workflow-123' })
  workflow_id: string;

  @ApiProperty({ description: 'Execution status', enum: ExecutionStatus, example: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @ApiProperty({ description: 'Success message', example: 'Workflow execution started successfully' })
  message: string;
}

/**
 * Get Workflow Executions Response Schema
 */
export class GetWorkflowExecutionsResponseSchema {
  @ApiProperty({ description: 'List of executions', type: [WorkflowExecutionSchema] })
  executions: WorkflowExecutionSchema[];

  @ApiProperty({ description: 'Pagination information', type: PaginationSchema })
  pagination: PaginationSchema;
}

/**
 * Workflow Error Response Schemas
 */
export class WorkflowNotFoundErrorResponseSchema extends NotFoundErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 404 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Workflow not found' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Not Found' })
  error: string;
}

export class WorkflowBadRequestErrorResponseSchema extends BadRequestErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Invalid workflow data' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Bad Request' })
  error: string;
}

/**
 * Workflow Validation Error Response Schema
 */
export class WorkflowValidationErrorResponseSchema {
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
      'company_id should not be empty',
      'steps should not be empty'
    ],
    type: [String]
  })
  errors: string[];
}

/**
 * Workflow Execution Error Response Schema
 */
export class WorkflowExecutionErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Workflow execution failed' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Bad Request' })
  error: string;

  @ApiProperty({ description: 'Execution ID', example: 'exec-123', required: false })
  execution_id?: string;
}
