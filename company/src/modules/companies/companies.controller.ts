import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceJwtGuard } from '@guards/service-jwt.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/companies.dto';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(ServiceJwtGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies for user' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async getUserCompanies(@Request() req) {
    return this.companiesService.getUserCompanies(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompany(@Param('id') id: string, @Request() req) {
    return this.companiesService.getCompany(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companiesService.createCompany(createCompanyDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async deleteCompany(@Param('id') id: string, @Request() req) {
    return this.companiesService.deleteCompany(id, req.user.id);
  }
}
