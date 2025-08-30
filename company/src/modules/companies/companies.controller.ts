import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto, GetUserCompaniesQueryDto } from './dto/companies.dto';
import {
  GetUserCompaniesResponseSchema,
  GetCompanyResponseSchema,
  CreateCompanyResponseSchema,
  UpdateCompanyResponseSchema,
  DeleteCompanyResponseSchema,
  UnauthorizedErrorResponseSchema,
  ForbiddenErrorResponseSchema,
  NotFoundErrorResponseSchema,
  BadRequestErrorResponseSchema,
  ConflictErrorResponseSchema,
  ServerErrorResponseSchema
} from '@schemas';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test companies endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async testEndpoint() {
    return { message: 'Companies endpoint is working!', timestamp: new Date().toISOString() };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all companies for user' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully', type: GetUserCompaniesResponseSchema })
  @ApiResponse({ status: 400, description: 'Bad request', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async getUserCompanies(@Request() req, @Query() query: GetUserCompaniesQueryDto) {
    return this.companiesService.getUserCompanies(req.user.id, query.page, query.limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully', type: GetCompanyResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async getCompany(@Param('id') id: string, @Request() req) {
    return this.companiesService.getCompany(id, req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully', type: CreateCompanyResponseSchema })
  @ApiResponse({ status: 400, description: 'Bad request', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema })
  @ApiResponse({ status: 409, description: 'Company with this domain already exists', type: ConflictErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companiesService.createCompany(createCompanyDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully', type: UpdateCompanyResponseSchema })
  @ApiResponse({ status: 400, description: 'Bad request', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema })
  @ApiResponse({ status: 409, description: 'Company with this domain already exists', type: ConflictErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully', type: DeleteCompanyResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async deleteCompany(@Param('id') id: string, @Request() req) {
    return this.companiesService.deleteCompany(id, req.user.id);
  }

  @Post(':id/set-default')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set company as default for user' })
  @ApiResponse({ status: 200, description: 'Default company set successfully', type: GetCompanyResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async setDefaultCompany(@Param('id') id: string, @Request() req) {
    return this.companiesService.setDefaultCompany(id, req.user.id);
  }

  @Get('default/current')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current default company for user' })
  @ApiResponse({ status: 200, description: 'Default company retrieved successfully', type: GetCompanyResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'No default company found', type: NotFoundErrorResponseSchema })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ServerErrorResponseSchema })
  async getDefaultCompany(@Request() req) {
    return this.companiesService.getDefaultCompany(req.user.id);
  }
}
