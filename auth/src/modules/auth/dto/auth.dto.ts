import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, LogoutType } from '../../../types/user.types';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;
}

export class RegisterDto {
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

  @ApiProperty({ example: 'My Company' })
  @IsString()
  company_name: string;

  @ApiProperty({ example: 'mycompany.com', required: false })
  @IsOptional()
  @IsString()
  company_domain?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_here' })
  @IsString()
  refresh_token: string;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  @IsOptional()
  @IsString()
  user_agent?: string;
}

export class LogoutDto {
  @ApiProperty({ example: 'refresh_token_here' })
  @IsString()
  refresh_token: string;

  @ApiProperty({ example: 'current', description: 'Logout from all devices or just current session', enum: ['current', 'all'], default: 'current' })
  @IsOptional()
  logout_type?: LogoutType;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  new_password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification_token_here' })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

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

  @ApiProperty({ example: 'company-123' })
  @IsString()
  company_id: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  company_role?: UserRole;

  @ApiProperty({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;
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
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsString()
  current_password: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  new_password: string;
}

export class GetSessionsDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;
}

export class RevokeSessionDto {
  @ApiProperty({ example: 'session-id-here' })
  @IsString()
  session_id: string;
}

export class LockUserDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: 'Account locked due to suspicious activity' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 30, description: 'Lock duration in minutes' })
  @IsOptional()
  duration_minutes?: number;
}

export class UnlockUserDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  user_id: string;
}

export class GetUserAuthStatusDto {
  @ApiProperty({ example: 'user-id-here' })
  @IsString()
  user_id: string;
}
