import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto, ExecuteWorkflowDto } from './dto/workflows.dto';

@ApiTags('Workflows')
@Controller('workflows')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get all workflows for an agent' })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  async getAgentWorkflows(@Param('agentId') agentId: string, @Request() req) {
    return this.workflowsService.getAgentWorkflows(agentId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async getWorkflow(@Param('id') id: string, @Request() req) {
    return this.workflowsService.getWorkflow(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async createWorkflow(@Body() createWorkflowDto: CreateWorkflowDto, @Request() req) {
    return this.workflowsService.createWorkflow(createWorkflowDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async updateWorkflow(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @Request() req,
  ) {
    return this.workflowsService.updateWorkflow(id, updateWorkflowDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
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
    schema: {
      type: 'object',
      properties: {
        execution_id: { type: 'string', example: 'exec-123' },
        workflow_id: { type: 'string', example: 'workflow-123' },
        status: { type: 'string', example: 'pending', enum: ['pending', 'running', 'completed', 'failed'] },
        message: { type: 'string', example: 'Workflow execution started successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Workflow not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Workflow not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async executeWorkflow(
    @Param('id') id: string,
    @Body() executeWorkflowDto: ExecuteWorkflowDto,
    @Request() req,
  ) {
    return this.workflowsService.executeWorkflow(id, executeWorkflowDto, req.user.id);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get workflow executions' })
  @ApiResponse({ status: 200, description: 'Executions retrieved successfully' })
  async getWorkflowExecutions(@Param('id') id: string, @Request() req) {
    return this.workflowsService.getWorkflowExecutions(id, req.user.id);
  }
}
