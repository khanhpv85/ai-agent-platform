import { Controller, Post, Get, Put, Delete, Patch, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { 
  LoginDto, 
  RegisterDto, 
  CreateUserDto, 
  UpdateUserDto, 
  ChangePasswordDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  GetSessionsDto,
  RevokeSessionDto,
  LockUserDto,
  UnlockUserDto,
  GetUserAuthStatusDto
} from './dto/auth.dto';
import {
  LoginResponseSchema,
  RegisterResponseSchema,
  RefreshTokenResponseSchema,
  LogoutResponseSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordResponseSchema,
  VerifyEmailResponseSchema,
  ResendVerificationResponseSchema,
  GetSessionsResponseSchema,
  RevokeSessionResponseSchema,
  LockUserResponseSchema,
  UnlockUserResponseSchema,
  UserAuthStatusSchema,
  TokenValidationResponseSchema,
  HealthCheckResponseSchema,
  AuthErrorResponseSchema,
  ConflictErrorResponseSchema,
  BadRequestErrorResponseSchema,
  NotFoundErrorResponseSchema,
  ProfileUpdateResponseSchema,
  PasswordChangeResponseSchema,
  UserCreateResponseSchema,
  UserUpdateResponseSchema,
  UserSchema
} from '@schemas';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns access token, refresh token, and user information.',
    tags: ['Authentication']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponseSchema
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    type: AuthErrorResponseSchema
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Account locked',
    type: AuthErrorResponseSchema
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'User registration',
    description: 'Register a new user and create their company. This endpoint creates both the user account and their associated company.',
    tags: ['Authentication']
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful',
    type: RegisterResponseSchema
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User or company already exists',
    type: ConflictErrorResponseSchema
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh-token')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token.',
    tags: ['Authentication']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseSchema
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid refresh token',
    type: AuthErrorResponseSchema
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Logout user and revoke refresh token. Optionally logout from all devices.',
    tags: ['Authentication']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    type: LogoutResponseSchema
  })
  async logout(@Body() logoutDto: LogoutDto) {
    console.log('Logout controller received:', JSON.stringify(logoutDto, null, 2));
    return this.authService.logout(logoutDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user information',
    description: 'Get detailed information about the currently authenticated user.',
    tags: ['User Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User information retrieved successfully',
    type: UserSchema
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async me(@Request() req) {
    return this.authService.me(req.user.id);
  }

  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send a password reset link to the user\'s email address.',
    tags: ['Password Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reset link sent (if email exists)',
    type: ForgotPasswordResponseSchema
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Reset password using a valid reset token.',
    tags: ['Password Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successful',
    type: ResetPasswordResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired reset token',
    type: BadRequestErrorResponseSchema
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @ApiOperation({ 
    summary: 'Verify email address',
    description: 'Verify user email address using verification token.',
    tags: ['Email Verification']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    type: VerifyEmailResponseSchema
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired verification token',
    type: BadRequestErrorResponseSchema
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @ApiOperation({ 
    summary: 'Resend email verification',
    description: 'Resend email verification link to user.',
    tags: ['Email Verification']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification link sent (if email exists)',
    type: ResendVerificationResponseSchema
  })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendVerificationDto);
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user sessions',
    description: 'Get list of active sessions for the current user.',
    tags: ['Session Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sessions retrieved successfully',
    type: GetSessionsResponseSchema
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async getSessions(@Request() req, @Query() getSessionsDto: GetSessionsDto) {
    return this.authService.getSessions(req.user.id, getSessionsDto);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Revoke session',
    description: 'Revoke a specific user session.',
    tags: ['Session Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Session revoked successfully',
    type: RevokeSessionResponseSchema
  })
  @ApiResponse({ status: 400, description: 'Session not found', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async revokeSession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.authService.revokeSession(req.user.id, { session_id: sessionId });
  }

  @Post('lock-user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Lock user account (Admin only)',
    description: 'Temporarily lock a user account for security reasons.',
    tags: ['Admin Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User locked successfully',
    type: LockUserResponseSchema
  })
  @ApiResponse({ status: 400, description: 'User not found', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Insufficient permissions', type: AuthErrorResponseSchema })
  async lockUser(@Request() req, @Body() lockUserDto: LockUserDto) {
    return this.authService.lockUser(lockUserDto, req.user);
  }

  @Post('unlock-user')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Unlock user account (Admin only)',
    description: 'Unlock a previously locked user account.',
    tags: ['Admin Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User unlocked successfully',
    type: UnlockUserResponseSchema
  })
  @ApiResponse({ status: 400, description: 'User not found', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Insufficient permissions', type: AuthErrorResponseSchema })
  async unlockUser(@Request() req, @Body() unlockUserDto: UnlockUserDto) {
    return this.authService.unlockUser(unlockUserDto, req.user);
  }

  @Get('user-auth-status/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user authentication status (Admin only)',
    description: 'Get detailed authentication status of a user including lock status, login attempts, etc.',
    tags: ['Admin Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User auth status retrieved successfully',
    type: UserAuthStatusSchema
  })
  @ApiResponse({ status: 400, description: 'User not found', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 403, description: 'Insufficient permissions', type: AuthErrorResponseSchema })
  async getUserAuthStatus(@Request() req, @Param('userId') userId: string) {
    return this.authService.getUserAuthStatus({ user_id: userId }, req.user);
  }

  @Post('validate-token')
  @ApiOperation({ 
    summary: 'Validate JWT token (Service-to-Service)',
    description: 'Validate a JWT token and return user information. Used for service-to-service authentication.',
    tags: ['Service Authentication']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token validation result',
    type: TokenValidationResponseSchema
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid token',
    type: TokenValidationResponseSchema
  })
  async validateToken(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Simple health check for service-to-service communication.',
    tags: ['Health Check']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    type: HealthCheckResponseSchema
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service'
    };
  }

  // Legacy endpoints (keeping for backward compatibility)
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile (Legacy)' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile (Legacy)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: ProfileUpdateResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(req.user.id, updateUserDto, req.user);
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password (Legacy)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully', type: PasswordChangeResponseSchema })
  @ApiResponse({ status: 400, description: 'Current password is incorrect', type: BadRequestErrorResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: UserSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  async getUsers(@Request() req, @Query() query: any) {
    return this.authService.getUsers(query, req.user);
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async getUserById(@Request() req, @Param('id') id: string) {
    return this.authService.getUserById(id, req.user);
  }

  @Post('users')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserCreateResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 409, description: 'User already exists', type: ConflictErrorResponseSchema })
  async createUser(@Request() req, @Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto, req.user);
  }

  @Put('users/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserUpdateResponseSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async updateUser(@Request() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto, req.user);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async deleteUser(@Request() req, @Param('id') id: string) {
    return this.authService.deleteUser(id, req.user);
  }

  @Patch('users/:id/activate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully', type: UserSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async activateUser(@Request() req, @Param('id') id: string) {
    return this.authService.activateUser(id, req.user);
  }

  @Patch('users/:id/deactivate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully', type: UserSchema })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async deactivateUser(@Request() req, @Param('id') id: string) {
    return this.authService.deactivateUser(id, req.user);
  }

  @Post('users/:id/resend-verification')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend verification email (Admin only)' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async resendUserVerification(@Request() req, @Param('id') id: string) {
    return this.authService.resendUserVerification(id, req.user);
  }

  @Post('users/:id/reset-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset user password (Admin only)' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: AuthErrorResponseSchema })
  @ApiResponse({ status: 404, description: 'User not found', type: NotFoundErrorResponseSchema })
  async resetUserPassword(@Request() req, @Param('id') id: string) {
    return this.authService.resetUserPassword(id, req.user);
  }
}
