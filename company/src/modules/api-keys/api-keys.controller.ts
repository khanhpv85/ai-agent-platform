import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import { 
  CreateApiKeyDto, 
  UpdateApiKeyDto, 
  ValidateApiKeyDto,
  ApiKeyResponseDto,
  CreateApiKeyResponseDto
} from './dto/api-keys.dto';

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test API keys endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async testEndpoint() {
    return { message: 'API Keys endpoint is working!', timestamp: new Date().toISOString() };
  }

  @Get('company/:companyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all API keys for company' })
  @ApiResponse({ status: 200, description: 'API keys retrieved successfully', type: [ApiKeyResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getCompanyApiKeys(@Param('companyId') companyId: string, @Request() req) {
    return this.apiKeysService.getCompanyApiKeys(companyId, req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully', type: CreateApiKeyResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto, @Request() req) {
    return this.apiKeysService.createApiKey(createApiKeyDto, req.user.id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate API key' })
  @ApiResponse({ status: 200, description: 'API key validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  @ApiResponse({ status: 403, description: 'API key inactive or expired' })
  async validateApiKey(@Body() validateApiKeyDto: ValidateApiKeyDto) {
    return this.apiKeysService.validateApiKey(validateApiKeyDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update API key' })
  @ApiResponse({ status: 200, description: 'API key updated successfully', type: ApiKeyResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async updateApiKey(
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
    @Request() req,
  ) {
    return this.apiKeysService.updateApiKey(id, updateApiKeyDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete API key' })
  @ApiResponse({ status: 200, description: 'API key deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async deleteApiKey(@Param('id') id: string, @Request() req) {
    return this.apiKeysService.deleteApiKey(id, req.user.id);
  }

  @Post(':id/regenerate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate API key' })
  @ApiResponse({ status: 200, description: 'API key regenerated successfully', type: CreateApiKeyResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async regenerateApiKey(@Param('id') id: string, @Request() req) {
    return this.apiKeysService.regenerateApiKey(id, req.user.id);
  }
}
