import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan, CompanyRole } from '@types';
import { NotFoundErrorResponseSchema, BadRequestErrorResponseSchema, PaginationSchema } from './base.schema';

/**
 * Company Schema
 */
export class CompanySchema {
  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  id: string;

  @ApiProperty({ description: 'Company name', example: 'My Company' })
  name: string;

  @ApiProperty({ description: 'Company domain', example: 'mycompany.com', nullable: true })
  domain?: string;

  @ApiProperty({ description: 'Subscription plan', enum: SubscriptionPlan, example: SubscriptionPlan.FREE })
  subscription_plan: SubscriptionPlan;

  @ApiProperty({ description: 'Maximum number of agents allowed', example: 5 })
  max_agents: number;

  @ApiProperty({ description: 'Company creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Company last update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

/**
 * User Company Schema (for user-company relationships)
 */
export class UserCompanySchema {
  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  id: string;

  @ApiProperty({ description: 'Company name', example: 'My Company' })
  name: string;

  @ApiProperty({ description: 'Company domain', example: 'mycompany.com', nullable: true })
  domain?: string;

  @ApiProperty({ description: 'Subscription plan', enum: SubscriptionPlan, example: SubscriptionPlan.FREE })
  subscription_plan: SubscriptionPlan;

  @ApiProperty({ description: 'Maximum number of agents allowed', example: 5 })
  max_agents: number;

  @ApiProperty({ description: 'User role in company', enum: CompanyRole, example: CompanyRole.OWNER })
  role: CompanyRole;

  @ApiProperty({ description: 'Company creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Company last update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

/**
 * Get User Companies Response Schema
 */
export class GetUserCompaniesResponseSchema {
  @ApiProperty({ description: 'User companies', type: [UserCompanySchema] })
  companies: UserCompanySchema[];

  @ApiProperty({ description: 'Pagination information', type: PaginationSchema })
  pagination: PaginationSchema;
}

/**
 * Get Company Response Schema
 */
export class GetCompanyResponseSchema {
  @ApiProperty({ description: 'Company ID', example: 'company-123' })
  id: string;

  @ApiProperty({ description: 'Company name', example: 'My Company' })
  name: string;

  @ApiProperty({ description: 'Company domain', example: 'mycompany.com', nullable: true })
  domain?: string;

  @ApiProperty({ description: 'Subscription plan', enum: SubscriptionPlan, example: SubscriptionPlan.FREE })
  subscription_plan: SubscriptionPlan;

  @ApiProperty({ description: 'Maximum number of agents allowed', example: 5 })
  max_agents: number;

  @ApiProperty({ description: 'User role in company', enum: CompanyRole, example: CompanyRole.OWNER })
  role: CompanyRole;

  @ApiProperty({ description: 'Company creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Company last update timestamp', example: '2024-01-01T00:00:00Z' })
  updated_at: string;
}

/**
 * Create Company Response Schema
 */
export class CreateCompanyResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Company created successfully' })
  message: string;

  @ApiProperty({ description: 'Created company information', type: CompanySchema })
  company: CompanySchema;
}

/**
 * Update Company Response Schema
 */
export class UpdateCompanyResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Company updated successfully' })
  message: string;

  @ApiProperty({ description: 'Updated company information', type: CompanySchema })
  company: CompanySchema;
}

/**
 * Delete Company Response Schema
 */
export class DeleteCompanyResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Company deleted successfully' })
  message: string;

  @ApiProperty({ description: 'Deleted company ID', example: 'company-123' })
  company_id: string;
}

/**
 * Unauthorized Error Response Schema
 */
export class UnauthorizedErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 401 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Unauthorized' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Unauthorized' })
  error: string;
}

/**
 * Forbidden Error Response Schema
 */
export class ForbiddenErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 403 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Access denied' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Forbidden' })
  error: string;
}

/**
 * Conflict Error Response Schema
 */
export class ConflictErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 409 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Company with this domain already exists' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Conflict' })
  error: string;
}

/**
 * Server Error Response Schema
 */
export class ServerErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 500 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Internal server error' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Internal Server Error' })
  error: string;
}

/**
 * Api Responses Company Schema
 */
export const ApiResponsesCompanySchema = {
  GetUserCompanies: [
    { status: 200, description: 'Companies retrieved successfully', type: GetUserCompaniesResponseSchema },
    { status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema },
    { status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema },
    { status: 500, description: 'Internal server error', type: ServerErrorResponseSchema },
  ],
  GetCompany: [
    { status: 200, description: 'Company retrieved successfully', type: GetCompanyResponseSchema },
    { status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema },
    { status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema },
    { status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema },
    { status: 500, description: 'Internal server error', type: ServerErrorResponseSchema },
  ],
  CreateCompany: [
    { status: 201, description: 'Company created successfully', type: CreateCompanyResponseSchema },
    { status: 400, description: 'Bad request', type: BadRequestErrorResponseSchema },
    { status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema },
    { status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema },
    { status: 409, description: 'Company with this domain already exists', type: ConflictErrorResponseSchema },
    { status: 500, description: 'Internal server error', type: ServerErrorResponseSchema },
  ],
  UpdateCompany: [
    { status: 200, description: 'Company updated successfully', type: UpdateCompanyResponseSchema },
    { status: 400, description: 'Bad request', type: BadRequestErrorResponseSchema },
    { status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema },
    { status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema },
    { status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema },
    { status: 409, description: 'Company with this domain already exists', type: ConflictErrorResponseSchema },
    { status: 500, description: 'Internal server error', type: ServerErrorResponseSchema },
  ],
  DeleteCompany: [
    { status: 200, description: 'Company deleted successfully', type: DeleteCompanyResponseSchema },
    { status: 401, description: 'Unauthorized', type: UnauthorizedErrorResponseSchema },
    { status: 403, description: 'Forbidden', type: ForbiddenErrorResponseSchema },
    { status: 404, description: 'Company not found', type: NotFoundErrorResponseSchema },
    { status: 500, description: 'Internal server error', type: ServerErrorResponseSchema },
  ],
};
