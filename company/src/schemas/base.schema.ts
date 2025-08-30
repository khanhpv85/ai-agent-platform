import { ApiProperty, ApiResponseOptions } from '@nestjs/swagger';

/**
 * Health Check Response Schema
 */
export class HealthCheckResponseSchema {
    @ApiProperty({ description: 'Service status', example: 'ok' })
    status: string;
  
    @ApiProperty({ description: 'Current timestamp', example: '2024-01-01T00:00:00Z' })
    timestamp: string;
  
    @ApiProperty({ description: 'Service name', example: 'auth-service' })
    service: string;
}

/**
 * Device Info Schema
 */
export class DeviceInfoSchema {
    @ApiProperty({ description: 'Is mobile device', example: false })
    is_mobile: boolean;
  
    @ApiProperty({ description: 'Is tablet device', example: false })
    is_tablet: boolean;
  
    @ApiProperty({ description: 'Browser name', example: 'Chrome' })
    browser: string;
}

/**
 * Pagination Schema
 */
export class PaginationSchema {
    @ApiProperty({ description: 'Current page number', example: 1 })
    page: number;
  
    @ApiProperty({ description: 'Items per page', example: 10 })
    limit: number;
  
    @ApiProperty({ description: 'Total number of items', example: 5 })
    total: number;
  
    @ApiProperty({ description: 'Total number of pages', example: 1 })
    pages: number;
}

/**
 * Not Found Error Response Schema
 */
export class NotFoundErrorResponseSchema {
    @ApiProperty({ description: 'HTTP status code', example: 404 })
    statusCode: number;
  
    @ApiProperty({ description: 'Error message', example: 'Not found value' })
    message: string;
  
    @ApiProperty({ description: 'Error type', example: 'Not Found' })
    error: string;
}

/**
 * Bad Request Error Response Schema
 */
export class BadRequestErrorResponseSchema {
    @ApiProperty({ description: 'HTTP status code', example: 400 })
    statusCode: number;
  
    @ApiProperty({ description: 'Error message', example: 'Invalid value' })
    message: string;
  
    @ApiProperty({ description: 'Error type', example: 'Bad Request' })
    error: string;
}