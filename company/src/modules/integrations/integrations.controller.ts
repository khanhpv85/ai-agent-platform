import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto, UpdateIntegrationDto } from './dto/integrations.dto';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all integrations for a company' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  async getCompanyIntegrations(@Param('companyId') companyId: string, @Request() req) {
    return this.integrationsService.getCompanyIntegrations(companyId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiResponse({ status: 200, description: 'Integration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(@Param('id') id: string, @Request() req) {
    return this.integrationsService.getIntegration(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new integration' })
  @ApiResponse({ status: 201, description: 'Integration created successfully' })
  async createIntegration(@Body() createIntegrationDto: CreateIntegrationDto, @Request() req) {
    return this.integrationsService.createIntegration(createIntegrationDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateIntegration(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
    @Request() req,
  ) {
    return this.integrationsService.updateIntegration(id, updateIntegrationDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete integration' })
  @ApiResponse({ status: 200, description: 'Integration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async deleteIntegration(@Param('id') id: string, @Request() req) {
    return this.integrationsService.deleteIntegration(id, req.user.id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Integration test completed' })
  async testIntegration(@Param('id') id: string, @Request() req) {
    return this.integrationsService.testIntegration(id, req.user.id);
  }
}
