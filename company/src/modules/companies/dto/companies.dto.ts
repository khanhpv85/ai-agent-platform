import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../../types/company.types';

export class CreateCompanyDto {
  @ApiProperty({ example: 'My Company' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'mycompany.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @ApiProperty({ enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscription_plan?: SubscriptionPlan;

  @ApiProperty({ example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_agents?: number;
}

export class UpdateCompanyDto {
  @ApiProperty({ example: 'My Updated Company', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: 'updatedcompany.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @ApiProperty({ enum: SubscriptionPlan, required: false })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscription_plan?: SubscriptionPlan;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_agents?: number;
}
