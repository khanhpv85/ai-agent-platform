import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto } from './dto/workflows.dto';
import {
  GetCompanyWorkflowsResponseSchema,
  GetWorkflowResponseSchema,
  CreateWorkflowRequestSchema,
  CreateWorkflowResponseSchema,
  UpdateWorkflowRequestSchema,
  UpdateWorkflowResponseSchema,
  DeleteWorkflowResponseSchema,
  ExecuteWorkflowRequestSchema,
  ExecuteWorkflowResponseSchema,
  GetWorkflowExecutionsResponseSchema,
  WorkflowNotFoundErrorResponseSchema,
  WorkflowBadRequestErrorResponseSchema,
  WorkflowValidationErrorResponseSchema,
  WorkflowExecutionErrorResponseSchema
} from '@schemas';

@ApiTags('Workflows')
@Controller('workflows')
@UseGuards(ServiceJwtGuard)
@ApiBearerAuth()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('company/:companyId')
  @ApiOperation({ 
    summary: 'Get all workflows for a company',
    description: 'Retrieve all workflows associated with a specific company. Returns a list of workflows with their configurations, status, and metadata.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflows retrieved successfully',
    type: GetCompanyWorkflowsResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found',
    type: WorkflowNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async getCompanyWorkflows(@Param('companyId') companyId: string, @Request() req) {
    return this.workflowsService.getCompanyWorkflows(companyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get workflow by ID',
    description: 'Retrieve a specific workflow by its unique identifier. Returns detailed information about the workflow including its steps, triggers, and metadata.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow retrieved successfully',
    type: GetWorkflowResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow not found',
    type: WorkflowNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async getWorkflow(@Param('id') id: string, @Request() req) {
    return this.workflowsService.getWorkflow(id, req.user.id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new workflow',
    description: 'Create a new workflow with the specified configuration, steps, and triggers. The workflow will be associated with the provided company and created by the authenticated user.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Workflow created successfully',
    type: CreateWorkflowResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed',
    type: WorkflowValidationErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async createWorkflow(@Body() createWorkflowDto: CreateWorkflowDto, @Request() req) {
    return this.workflowsService.createWorkflow(createWorkflowDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update workflow',
    description: 'Update an existing workflow with new configuration, steps, triggers, or metadata. Only the provided fields will be updated.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow updated successfully',
    type: UpdateWorkflowResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow not found',
    type: WorkflowNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed',
    type: WorkflowValidationErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async updateWorkflow(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @Request() req,
  ) {
    return this.workflowsService.updateWorkflow(id, updateWorkflowDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete workflow',
    description: 'Permanently delete a workflow and all its associated executions. This action cannot be undone.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow deleted successfully',
    type: DeleteWorkflowResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow not found',
    type: WorkflowNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async deleteWorkflow(@Param('id') id: string, @Request() req) {
    return this.workflowsService.deleteWorkflow(id, req.user.id);
  }

  @Post(':id/execute')
  @ApiOperation({ 
    summary: 'Execute workflow',
    description: 'Execute a workflow with the provided input data. This endpoint starts the workflow execution asynchronously and returns an execution ID for tracking.',
    tags: ['Workflows']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workflow execution started',
    type: ExecuteWorkflowResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow not found',
    type: WorkflowNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Execution failed',
    type: WorkflowExecutionErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async executeWorkflow(
    @Param('id') id: string,
    @Body() executeWorkflowDto: ExecuteWorkflowDto,
    @Request() req,
  ) {
    return this.workflowsService.executeWorkflow(id, executeWorkflowDto, req.user.id);
  }

  @Get(':id/executions')
  @ApiOperation({ 
    summary: 'Get workflow executions',
    description: 'Retrieve all executions for a specific workflow. Returns a list of executions with their status, input/output data, and timestamps.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Executions retrieved successfully',
    type: GetWorkflowExecutionsResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow not found',
    type: WorkflowNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: WorkflowBadRequestErrorResponseSchema
  })
  async getWorkflowExecutions(@Param('id') id: string, @Request() req) {
    return this.workflowsService.getWorkflowExecutions(id, req.user.id);
  }
}
