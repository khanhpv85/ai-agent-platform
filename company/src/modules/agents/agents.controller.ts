import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto, UpdateLLMConfigDto, UpdateKnowledgeBaseConfigDto } from './dto/agents.dto';
import {
  GetCompanyAgentsResponseSchema,
  GetAgentResponseSchema,
  CreateAgentRequestSchema,
  CreateAgentResponseSchema,
  UpdateAgentRequestSchema,
  UpdateAgentResponseSchema,
  DeleteAgentResponseSchema,
  AgentNotFoundErrorResponseSchema,
  AgentBadRequestErrorResponseSchema,
  AgentValidationErrorResponseSchema
} from '@schemas';

@ApiTags('Agents')
@Controller('agents')
@UseGuards(ServiceJwtGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get('company/:companyId')
  @ApiOperation({ 
    summary: 'Get all agents for a company',
    description: 'Retrieve all AI agents associated with a specific company. This endpoint returns a list of agents with their configurations, status, and metadata.',
    tags: ['Agents']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agents retrieved successfully',
    type: GetCompanyAgentsResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found',
    type: AgentNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async getCompanyAgents(@Param('companyId') companyId: string, @Request() req) {
    return this.agentsService.getCompanyAgents(companyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get agent by ID',
    description: 'Retrieve a specific agent by its unique identifier. Returns detailed information about the agent including its configuration and metadata.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agent retrieved successfully',
    type: GetAgentResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not found',
    type: AgentNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async getAgent(@Param('id') id: string, @Request() req) {
    return this.agentsService.getAgent(id, req.user.id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new agent',
    description: 'Create a new AI agent with the specified configuration. The agent will be associated with the provided company and created by the authenticated user.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Agent created successfully',
    type: CreateAgentResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed',
    type: AgentValidationErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async createAgent(@Body() createAgentDto: CreateAgentDto, @Request() req) {
    return this.agentsService.createAgent(createAgentDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update agent',
    description: 'Update an existing agent with new configuration, status, or metadata. Only the provided fields will be updated.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agent updated successfully',
    type: UpdateAgentResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not found',
    type: AgentNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed',
    type: AgentValidationErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async updateAgent(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Request() req,
  ) {
    return this.agentsService.updateAgent(id, updateAgentDto, req.user.id);
  }

  @Put(':id/llm-config')
  @ApiOperation({ 
    summary: 'Update agent LLM configuration',
    description: 'Update only the LLM configuration of an agent. This endpoint is optimized for updating language model settings without affecting other configuration sections.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'LLM configuration updated successfully',
    type: UpdateAgentResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not found',
    type: AgentNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed',
    type: AgentValidationErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async updateLLMConfiguration(
    @Param('id') id: string,
    @Body() llmConfigDto: UpdateLLMConfigDto,
    @Request() req,
  ) {
    return this.agentsService.updateLLMConfiguration(id, llmConfigDto, req.user.id);
  }

  @Put(':id/knowledge-base-config')
  @ApiOperation({ 
    summary: 'Update agent knowledge base configuration',
    description: 'Update only the knowledge base configuration of an agent. This endpoint is optimized for updating knowledge base selections without affecting other configuration sections.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Knowledge base configuration updated successfully',
    type: UpdateAgentResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not found',
    type: AgentNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed',
    type: AgentValidationErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async updateKnowledgeBaseConfiguration(
    @Param('id') id: string,
    @Body() knowledgeBaseConfigDto: UpdateKnowledgeBaseConfigDto,
    @Request() req,
  ) {
    return this.agentsService.updateKnowledgeBaseConfiguration(id, knowledgeBaseConfigDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete agent',
    description: 'Permanently delete an agent and all its associated data. This action cannot be undone.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agent deleted successfully',
    type: DeleteAgentResponseSchema
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not found',
    type: AgentNotFoundErrorResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request',
    type: AgentBadRequestErrorResponseSchema
  })
  async deleteAgent(@Param('id') id: string, @Request() req) {
    return this.agentsService.deleteAgent(id, req.user.id);
  }
}
