import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from './dto/agents.dto';

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
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'agent-123' },
          name: { type: 'string', example: 'Customer Support Agent' },
          description: { type: 'string', example: 'AI agent for handling customer inquiries' },
          status: { type: 'string', example: 'active', enum: ['active', 'inactive', 'draft'] },
          agent_type: { type: 'string', example: 'workflow', enum: ['workflow', 'chatbot', 'assistant'] },
          configuration: { type: 'object', example: { model: 'gpt-3.5-turbo', temperature: 0.7 } },
          created_by: { type: 'string', example: 'John Doe' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Company not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async getCompanyAgents(@Param('companyId') companyId: string, @Request() req) {
    return this.agentsService.getCompanyAgents(companyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  @ApiResponse({ status: 200, description: 'Agent retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgent(@Param('id') id: string, @Request() req) {
    return this.agentsService.getAgent(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new agent' })
  @ApiResponse({ status: 201, description: 'Agent created successfully' })
  async createAgent(@Body() createAgentDto: CreateAgentDto, @Request() req) {
    return this.agentsService.createAgent(createAgentDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update agent' })
  @ApiResponse({ status: 200, description: 'Agent updated successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async updateAgent(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Request() req,
  ) {
    return this.agentsService.updateAgent(id, updateAgentDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete agent' })
  @ApiResponse({ status: 200, description: 'Agent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async deleteAgent(@Param('id') id: string, @Request() req) {
    return this.agentsService.deleteAgent(id, req.user.id);
  }
}
