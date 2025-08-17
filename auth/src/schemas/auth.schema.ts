import { ApiProperty } from '@nestjs/swagger';
import { 
    HealthCheckResponseSchema, 
    DeviceInfoSchema,
    PaginationSchema,
    BadRequestErrorResponseSchema,
    NotFoundErrorResponseSchema
} from './base.schema';

/**
 * User Company Schema
 */
export class UserCompanySchema {
    @ApiProperty({ description: 'Company ID', example: 'company-123' })
    id: string;

    @ApiProperty({ description: 'Company name', example: 'My Company' })
    name: string;

    @ApiProperty({ description: 'User role in company', example: 'owner' })
    role: string;
}

/**
 * User Entity Schema
 */
export class UserSchema {
  @ApiProperty({ description: 'User ID', example: 'user-123' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  last_name: string;

  @ApiProperty({ description: 'User role', example: 'user' })
  role: string;

  @ApiProperty({ description: 'Email verification status', example: true })
  email_verified: boolean;

  @ApiProperty({ description: 'Last login timestamp', example: '2024-01-01T00:00:00Z', required: false })
  last_login_at?: string;

  @ApiProperty({ description: 'User companies', type: [UserCompanySchema] })
  companies: UserCompanySchema[];
}

/**
 * Login Response Schema
 */
export class LoginResponseSchema {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token', example: 'refresh_token_here' })
  refresh_token: string;

  @ApiProperty({ description: 'Access token expiration time in seconds', example: 900 })
  expires_in: number;

  @ApiProperty({ description: 'Refresh token expiration time in seconds', example: 604800 })
  refresh_expires_in: number;

  @ApiProperty({ description: 'User information', type: UserSchema })
  user: UserSchema;
}

/**
 * Register Response Schema
 */
export class RegisterResponseSchema {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token', example: 'refresh_token_here' })
  refresh_token: string;

  @ApiProperty({ description: 'Access token expiration time in seconds', example: 900 })
  expires_in: number;

  @ApiProperty({ description: 'Refresh token expiration time in seconds', example: 604800 })
  refresh_expires_in: number;

  @ApiProperty({ description: 'User information', type: UserSchema })
  user: UserSchema;
}

/**
 * Refresh Token Response Schema
 */
export class RefreshTokenResponseSchema {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token', example: 'new_refresh_token_here' })
  refresh_token: string;

  @ApiProperty({ description: 'Access token expiration time in seconds', example: 900 })
  expires_in: number;

  @ApiProperty({ description: 'Refresh token expiration time in seconds', example: 604800 })
  refresh_expires_in: number;
}

/**
 * Logout Response Schema
 */
export class LogoutResponseSchema {
  @ApiProperty({ description: 'Logout message', example: 'Logged out successfully' })
  message: string;
}

/**
 * Forgot Password Response Schema
 */
export class ForgotPasswordResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'If the email exists, a password reset link has been sent' })
  message: string;
}

/**
 * Reset Password Response Schema
 */
export class ResetPasswordResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Password reset successfully' })
  message: string;
}

/**
 * Verify Email Response Schema
 */
export class VerifyEmailResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Email verified successfully' })
  message: string;
}

/**
 * Resend Verification Response Schema
 */
export class ResendVerificationResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'If the email exists, a verification link has been sent' })
  message: string;
}

/**
 * User Session Schema
 */
export class UserSessionSchema {
  @ApiProperty({ description: 'Session ID', example: 'session-123' })
  id: string;

  @ApiProperty({ description: 'Session creation timestamp', example: '2024-01-01T00:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Last activity timestamp', example: '2024-01-01T00:00:00Z' })
  last_activity_at: string;

  @ApiProperty({ description: 'IP address', example: '192.168.1.1' })
  ip_address: string;

  @ApiProperty({ description: 'User agent string', example: 'Mozilla/5.0...' })
  user_agent: string;

  @ApiProperty({ description: 'Device information', type: DeviceInfoSchema })
  device_info: DeviceInfoSchema;
}

/**
 * Get Sessions Response Schema
 */
export class GetSessionsResponseSchema {
  @ApiProperty({ description: 'User sessions', type: [UserSessionSchema] })
  sessions: UserSessionSchema[];

  @ApiProperty({ description: 'Pagination information', type: PaginationSchema })
  pagination: PaginationSchema;
}

/**
 * Revoke Session Response Schema
 */
export class RevokeSessionResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Session revoked successfully' })
  message: string;
}

/**
 * Lock User Response Schema
 */
export class LockUserResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'User locked for 30 minutes' })
  message: string;
}

/**
 * Unlock User Response Schema
 */
export class UnlockUserResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'User unlocked successfully' })
  message: string;
}

/**
 * User Auth Status Schema
 */
export class UserAuthStatusSchema {
  @ApiProperty({ description: 'User ID', example: 'user-123' })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Authentication status', example: 'active' })
  auth_status: string;

  @ApiProperty({ description: 'Is user locked', example: false })
  is_locked: boolean;

  @ApiProperty({ description: 'Number of login attempts', example: 0 })
  login_attempts: number;

  @ApiProperty({ description: 'Lock expiration timestamp', example: null, nullable: true })
  locked_until: string | null;

  @ApiProperty({ description: 'Last login timestamp', example: '2024-01-01T00:00:00Z' })
  last_login_at: string;

  @ApiProperty({ description: 'Email verification status', example: true })
  email_verified: boolean;

  @ApiProperty({ description: 'Number of active sessions', example: 2 })
  active_sessions: number;
}

/**
 * Token Validation User Info Schema
 */
export class TokenValidationUserInfoSchema {
  @ApiProperty({ description: 'User ID', example: 'user-123' })
  user_id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  last_name: string;

  @ApiProperty({ description: 'User role', example: 'user' })
  role: string;

  @ApiProperty({ description: 'Is user active', example: true })
  is_active: boolean;

  @ApiProperty({ description: 'Email verification status', example: true })
  email_verified: boolean;
}

/**
 * Token Validation Response Schema
 */
export class TokenValidationResponseSchema {
  @ApiProperty({ description: 'Validation success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Validation message', example: 'Token validated successfully' })
  message: string;

  @ApiProperty({ description: 'Token validity', example: true })
  valid: boolean;

  @ApiProperty({ description: 'User information', type: TokenValidationUserInfoSchema, nullable: true })
  user_info: TokenValidationUserInfoSchema | null;
}

/**
 * Auth Error Response Schema
 */
export class AuthErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 401 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'Invalid credentials' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Unauthorized' })
  error: string;
}

/**
 * Conflict Error Response Schema
 */
export class ConflictErrorResponseSchema {
  @ApiProperty({ description: 'HTTP status code', example: 409 })
  statusCode: number;

  @ApiProperty({ description: 'Error message', example: 'User with this email already exists' })
  message: string;

  @ApiProperty({ description: 'Error type', example: 'Conflict' })
  error: string;
}

/**
 * Profile Update Response Schema
 */
export class ProfileUpdateResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Profile updated successfully' })
  message: string;
}

/**
 * Password Change Response Schema
 */
export class PasswordChangeResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'Password changed successfully' })
  message: string;
}

/**
 * User Create Response Schema
 */
export class UserCreateResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'User created successfully' })
  message: string;

  @ApiProperty({ description: 'Created user information', type: UserSchema })
  user: UserSchema;
}

/**
 * User Update Response Schema
 */
export class UserUpdateResponseSchema {
  @ApiProperty({ description: 'Success message', example: 'User updated successfully' })
  message: string;

  @ApiProperty({ description: 'Updated user information', type: UserSchema })
  user: UserSchema;
}

/**
 * Api Responses Auth Schema
 */
export const ApiResponsesAuthSchema = {
    Login: [
        { status: 200, description: 'Login successful', type: LoginResponseSchema },
        { status: 401, description: 'Invalid credentials', type: AuthErrorResponseSchema },
        { status: 403, description: 'Account locked', type: AuthErrorResponseSchema },
    ],
    Register: [
        { status: 201, description: 'Registration successful', type: RegisterResponseSchema },
        { status: 409, description: 'User or company already exists', type: ConflictErrorResponseSchema },
    ],
    RefreshToken: [
        { status: 200, description: 'Token refreshed successfully', type: RefreshTokenResponseSchema },
        { status: 401, description: 'Invalid refresh token', type: AuthErrorResponseSchema },
    ],
    Logout: [
        { status: 200, description: 'Logout successful', type: LogoutResponseSchema },
    ],
    Me: [
        { status: 200, description: 'User information retrieved successfully', type: UserSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
    ],
    ForgotPassword: [
        { status: 200, description: 'Reset link sent (if email exists)', type: ForgotPasswordResponseSchema },
    ],
    ResetPassword: [
        { status: 200, description: 'Password reset successful', type: ResetPasswordResponseSchema },
        { status: 400, description: 'Invalid or expired reset token', type: BadRequestErrorResponseSchema },
    ],
    VerifyEmail: [
        { status: 200, description: 'Email verified successfully', type: VerifyEmailResponseSchema },
        { status: 400, description: 'Invalid or expired verification token', type: BadRequestErrorResponseSchema },
    ],
    ResendVerification: [
        { status: 200, description: 'Verification link sent (if email exists)', type: ResendVerificationResponseSchema },
    ],
    GetSessions: [
        { status: 200, description: 'Sessions retrieved successfully', type: GetSessionsResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
    ],
    RevokeSession: [
        { status: 200, description: 'Session revoked successfully', type: RevokeSessionResponseSchema },
        { status: 400, description: 'Session not found', type: BadRequestErrorResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
    ],
    LockUser: [
        { status: 200, description: 'User locked successfully', type: LockUserResponseSchema },
        { status: 400, description: 'User not found', type: BadRequestErrorResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
        { status: 403, description: 'Insufficient permissions', type: AuthErrorResponseSchema },
    ],
    UnlockUser: [
        { status: 200, description: 'User unlocked successfully', type: UnlockUserResponseSchema },
        { status: 400, description: 'User not found', type: BadRequestErrorResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
        { status: 403, description: 'Insufficient permissions', type: AuthErrorResponseSchema },
    ],
    GetUserAuthStatus: [
        { status: 200, description: 'User auth status retrieved successfully', type: UserAuthStatusSchema },
        { status: 400, description: 'User not found', type: BadRequestErrorResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
        { status: 403, description: 'Insufficient permissions', type: AuthErrorResponseSchema },
    ],
    ValidateToken: [
        { status: 200, description: 'Token validation result', type: TokenValidationResponseSchema },
        { status: 401, description: 'Invalid token', type: TokenValidationResponseSchema },
    ],
    HealthCheck: [
        { status: 200, description: 'Service is healthy', type: HealthCheckResponseSchema },
    ],
    // Legacy endpoints
    GetProfile: [
        { status: 200, description: 'Profile retrieved successfully', type: UserSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
    ],
    UpdateProfile: [
        { status: 200, description: 'Profile updated successfully', type: ProfileUpdateResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
    ],
    ChangePassword: [
        { status: 200, description: 'Password changed successfully', type: PasswordChangeResponseSchema },
        { status: 400, description: 'Current password is incorrect', type: BadRequestErrorResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
    ],
    CreateUser: [
        { status: 201, description: 'User created successfully', type: UserCreateResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
        { status: 409, description: 'User already exists', type: ConflictErrorResponseSchema },
    ],
    UpdateUser: [
        { status: 200, description: 'User updated successfully', type: UserUpdateResponseSchema },
        { status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema },
        { status: 404, description: 'User not found', type: NotFoundErrorResponseSchema },
    ],
};
