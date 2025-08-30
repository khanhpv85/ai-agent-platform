import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@ApiTags('Knowledge Bases')
@Controller('knowledge-bases')
@UseGuards(ServiceJwtGuard)
@ApiBearerAuth()
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get('company/:companyId')
  @ApiOperation({ 
    summary: 'Get all knowledge bases for a company',
    description: 'Retrieve all knowledge bases associated with a specific company. This endpoint returns a list of knowledge bases with their configurations and metadata.',
    tags: ['Knowledge Bases']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Knowledge bases retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company not found'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied'
  })
  async getCompanyKnowledgeBases(@Param('companyId') companyId: string, @Request() req) {
    return this.knowledgeBaseService.getCompanyKnowledgeBases(companyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get knowledge base by ID',
    description: 'Retrieve a specific knowledge base by its unique identifier. Returns detailed information about the knowledge base including its configuration and metadata.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Knowledge base retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Knowledge base not found'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied'
  })
  async getKnowledgeBase(@Param('id') id: string, @Request() req) {
    return this.knowledgeBaseService.getKnowledgeBase(id, req.user.id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new knowledge base',
    description: 'Create a new knowledge base with the specified configuration. The knowledge base will be associated with the provided company.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Knowledge base created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied'
  })
  async createKnowledgeBase(@Body() createKnowledgeBaseDto: CreateKnowledgeBaseDto, @Request() req) {
    return this.knowledgeBaseService.createKnowledgeBase(createKnowledgeBaseDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update knowledge base',
    description: 'Update an existing knowledge base with new configuration or metadata. Only the provided fields will be updated.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Knowledge base updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Knowledge base not found'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied'
  })
  async updateKnowledgeBase(
    @Param('id') id: string,
    @Body() updateKnowledgeBaseDto: UpdateKnowledgeBaseDto,
    @Request() req,
  ) {
    return this.knowledgeBaseService.updateKnowledgeBase(id, updateKnowledgeBaseDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete knowledge base',
    description: 'Permanently delete a knowledge base and all its associated data. This action cannot be undone.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Knowledge base deleted successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Knowledge base not found'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied'
  })
  async deleteKnowledgeBase(@Param('id') id: string, @Request() req) {
    return this.knowledgeBaseService.deleteKnowledgeBase(id, req.user.id);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ 
    summary: 'Toggle knowledge base status',
    description: 'Toggle the active status of a knowledge base between active and inactive.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Knowledge base status toggled successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Knowledge base not found'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Access denied'
  })
  async toggleKnowledgeBaseStatus(@Param('id') id: string, @Request() req) {
    return this.knowledgeBaseService.toggleKnowledgeBaseStatus(id, req.user.id);
  }
}
