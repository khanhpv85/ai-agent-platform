import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole, UserRole } from '@types';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ enum: CompanyRole, default: CompanyRole.MEMBER })
  @IsOptional()
  @IsEnum(CompanyRole)
  company_role?: CompanyRole;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  is_active?: boolean;
}
