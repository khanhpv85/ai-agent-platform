import { IsString, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStatus } from '../../../types/workflow.types';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Data Processing Workflow' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Process and analyze data using AI', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'company-123' })
  @IsString()
  company_id: string;

  @ApiProperty({ enum: WorkflowStatus, default: WorkflowStatus.DRAFT })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiProperty({ 
    example: [
      {
        type: 'ai_reasoning',
        agent_id: 'agent-123',
        name: 'AI Analysis Step',
        config: { model: 'gpt-3.5-turbo' }
      },
      {
        type: 'api_call',
        agent_id: 'agent-456',
        name: 'API Processing Step',
        config: { 
          method: 'POST',
          url: 'https://api.example.com/process',
          headers: { 'Content-Type': 'application/json' }
        }
      }
    ]
  })
  @IsArray()
  steps: any[];

  @ApiProperty({ 
    example: {
      webhook: 'https://example.com/webhook',
      schedule: '0 0 * * *'
    },
    required: false 
  })
  @IsOptional()
  @IsObject()
  triggers?: any;
}

export class UpdateWorkflowDto {
  @ApiProperty({ example: 'Updated Workflow Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated workflow description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkflowStatus, required: false })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiProperty({ 
    example: [
      {
        type: 'ai_reasoning',
        agent_id: 'agent-123',
        name: 'Updated AI Step',
        config: { model: 'gpt-4' }
      }
    ],
    required: false 
  })
  @IsOptional()
  @IsArray()
  steps?: any[];

  @ApiProperty({ 
    example: {
      webhook: 'https://updated.example.com/webhook'
    },
    required: false 
  })
  @IsOptional()
  @IsObject()
  triggers?: any;
}

export class ExecuteWorkflowDto {
  @ApiProperty({ 
    example: {
      text: 'Sample input data for workflow execution',
      parameters: { key: 'value' }
    }
  })
  @IsObject()
  input_data: any;
}
