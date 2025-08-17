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

  @ApiProperty({ example: 'agent-123' })
  @IsString()
  agent_id: string;

  @ApiProperty({ enum: WorkflowStatus, default: WorkflowStatus.DRAFT })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiProperty({ 
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

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkflowStatus, required: false })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  steps?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  triggers?: any;
}

export class ExecuteWorkflowDto {
  @ApiProperty({ 
    example: {
      text: 'Sample text to process',
      parameters: { max_length: 100 }
    }
  })
  @IsObject()
  input_data: any;
}
