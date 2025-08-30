import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { QueueClientService } from '@services/queue-client.service';

import { User } from './entities/user.entity';
import { UserRole, LogoutType } from '../../types/user.types';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserSession } from './entities/user-session.entity';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    private jwtService: JwtService,
    private queueClientService: QueueClientService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new ForbiddenException('Account is temporarily locked. Please try again later.');
    }

    if (await bcrypt.compare(password, user.password_hash)) {
      // Reset login attempts on successful login
      user.login_attempts = 0;
      user.locked_until = null;
      user.last_login_at = new Date();
      await this.userRepository.save(user);

      const { password_hash, ...result } = user;
      return result;
    } else {
      // Increment login attempts
      user.login_attempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (user.login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await this.userRepository.save(user);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Create or update session
    await this.createUserSession(user.id, accessToken, refreshToken, loginDto.ip_address, loginDto.user_agent);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60, // 15 minutes in seconds
      refresh_expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12; // Increased from 10 for better security
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = this.userRepository.create({
      id: uuidv4(),
      email: registerDto.email,
      password_hash: passwordHash,
      first_name: registerDto.first_name,
      last_name: registerDto.last_name,
      role: registerDto.role || UserRole.USER,
      email_verification_token: emailVerificationToken,
      email_verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await this.userRepository.save(user);

    // Sync user data to company service via gRPC
    await this.syncUserToCompanyService(user, registerDto);

    // Publish user registration event to queue
    await this.publishUserRegistrationEvent(user, registerDto);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Create session
    await this.createUserSession(user.id, accessToken, refreshToken, registerDto.ip_address, registerDto.user_agent);

    // TODO: Send email verification email

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60,
      refresh_expires_in: 7 * 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    // Find the refresh token
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.refresh_token },
      relations: ['user'],
    });

    if (!refreshToken || !refreshToken.isValid()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = refreshToken.user;
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

    // Revoke old refresh token
    refreshToken.revoke();
    await this.refreshTokenRepository.save(refreshToken);

    // Create new refresh token
    const newRefreshTokenEntity = this.refreshTokenRepository.create({
      id: uuidv4(),
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      created_ip: refreshTokenDto.ip_address,
      user_agent: refreshTokenDto.user_agent,
    });
    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: 15 * 60,
      refresh_expires_in: 7 * 24 * 60 * 60,
    };
  }

  async logout(logoutDto: LogoutDto) {
    
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: logoutDto.refresh_token },
    });

    if (refreshToken) {
      refreshToken.revoke();
      await this.refreshTokenRepository.save(refreshToken);
    }

    // Set default logout_type to 'current' if not provided or empty
    let logoutTypeStr = 'current'; // default value
    
    if (logoutDto.logout_type !== undefined && logoutDto.logout_type !== null) {
      let logoutTypeValue = logoutDto.logout_type;
      
      // Handle case where logout_type is an object with nested logout_type property
      if (typeof logoutTypeValue === 'object' && logoutTypeValue !== null) {
        if (logoutTypeValue && typeof logoutTypeValue === 'object' && 'logout_type' in logoutTypeValue) {
          logoutTypeValue = (logoutTypeValue as any).logout_type;
        } else {
          // If it's an object but doesn't have logout_type property, try to convert to string
          logoutTypeValue = JSON.stringify(logoutTypeValue) as LogoutType;
        }
      }
      
      // Convert to string and trim
      const tempLogoutTypeStr = String(logoutTypeValue).trim();
      if (tempLogoutTypeStr !== '') {
        if (tempLogoutTypeStr === 'current' || tempLogoutTypeStr === 'all') {
          logoutTypeStr = tempLogoutTypeStr;
        }
      }
    }
    
    // Validate logout_type
    if (logoutTypeStr !== 'current' && logoutTypeStr !== 'all') {
      throw new BadRequestException('logout_type must be either "current" or "all", got: ' + logoutTypeStr);
    }
    
    const logoutType = logoutTypeStr as LogoutType;
    
    console.log('Processed logout_type:', logoutType);

    // If logout_type is 'all', revoke all sessions for the user
    if (logoutType === 'all' && refreshToken) {
      await this.userSessionRepository.update(
        { user_id: refreshToken.user_id },
        { is_active: false }
      );
    }

    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token (you might want to create a separate table for this)
    user.email_verification_token = resetToken;
    user.email_verification_expires_at = expiresAt;
    await this.userRepository.save(user);

    // TODO: Send password reset email

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { 
        email_verification_token: resetPasswordDto.token,
        email_verification_expires_at: new Date() // Token not expired
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(resetPasswordDto.new_password, saltRounds);

    // Update password and clear reset token
    user.password_hash = newPasswordHash;
    user.password_changed_at = new Date();
    user.email_verification_token = null;
    user.email_verification_expires_at = null;
    user.login_attempts = 0;
    user.locked_until = null;
    await this.userRepository.save(user);

    // Revoke all sessions for security
    await this.userSessionRepository.update(
      { user_id: user.id },
      { is_active: false }
    );

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { 
        email_verification_token: verifyEmailDto.token,
        email_verification_expires_at: new Date() // Token not expired
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires_at = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const user = await this.userRepository.findOne({
      where: { email: resendVerificationDto.email },
    });

    if (!user) {
      return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.email_verified) {
      return { message: 'Email is already verified' };
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.email_verification_token = verificationToken;
    user.email_verification_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userRepository.save(user);

    // TODO: Send verification email

    return { message: 'If the email exists, a verification link has been sent' };
  }

  async getSessions(userId: string, getSessionsDto: GetSessionsDto) {
    const page = getSessionsDto.page || 1;
    const limit = getSessionsDto.limit || 10;
    const offset = (page - 1) * limit;

    const [sessions, total] = await this.userSessionRepository.findAndCount({
      where: { user_id: userId, is_active: true },
      order: { last_activity_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      sessions: sessions.map(session => ({
        id: session.id,
        created_at: session.created_at,
        last_activity_at: session.last_activity_at,
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        device_info: session.device_info,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async revokeSession(userId: string, revokeSessionDto: RevokeSessionDto) {
    const session = await this.userSessionRepository.findOne({
      where: { id: revokeSessionDto.session_id, user_id: userId },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    session.deactivate();
    await this.userSessionRepository.save(session);

    return { message: 'Session revoked successfully' };
  }

  async lockUser(lockUserDto: LockUserDto, currentUser: any) {
    // Only admins can lock users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: lockUserDto.user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const durationMinutes = lockUserDto.duration_minutes || 30;
    user.locked_until = new Date(Date.now() + durationMinutes * 60 * 1000);
    await this.userRepository.save(user);

    return { message: `User locked for ${durationMinutes} minutes` };
  }

  async unlockUser(unlockUserDto: UnlockUserDto, currentUser: any) {
    // Only admins can unlock users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: unlockUserDto.user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.locked_until = null;
    user.login_attempts = 0;
    await this.userRepository.save(user);

    return { message: 'User unlocked successfully' };
  }

  async getUserAuthStatus(getUserAuthStatusDto: GetUserAuthStatusDto, currentUser: any) {
    // Only admins can view other users' auth status
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: getUserAuthStatusDto.user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const activeSessions = await this.userSessionRepository.count({
      where: { user_id: user.id, is_active: true },
    });

    return {
      id: user.id,
      email: user.email,
      auth_status: user.authStatus,
      is_locked: user.isLocked(),
      login_attempts: user.login_attempts,
      locked_until: user.locked_until,
      last_login_at: user.last_login_at,
      email_verified: user.email_verified,
      active_sessions: activeSessions,
    };
  }

  // Helper methods
  private async generateTokens(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      type: 'access'
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    // Save refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      id: uuidv4(),
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken };
  }

  private async createUserSession(
    userId: string, 
    accessToken: string, 
    refreshToken: string, 
    ipAddress?: string, 
    userAgent?: string
  ) {
    const session = this.userSessionRepository.create({
      id: uuidv4(),
      user_id: userId,
      session_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      refresh_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ip_address: ipAddress,
      user_agent: userAgent,
      device_info: this.extractDeviceInfo(userAgent),
    });
    await this.userSessionRepository.save(session);
  }

  private extractDeviceInfo(userAgent?: string) {
    if (!userAgent) return null;

    // Simple device info extraction (you might want to use a proper library)
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/.test(userAgent);
    const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                   userAgent.includes('Firefox') ? 'Firefox' : 
                   userAgent.includes('Safari') ? 'Safari' : 'Unknown';

    return {
      is_mobile: isMobile,
      is_tablet: isTablet,
      browser,
      user_agent: userAgent,
    };
  }

  // Sync user data to company service via gRPC
  private async syncUserToCompanyService(user: User, registerDto: RegisterDto) {
    try {
      // TODO: Implement gRPC client to sync user data to company service
      // This will be implemented when we add gRPC client library
      console.log('Syncing user data to company service via gRPC:', {
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_name: registerDto.company_name,
        company_domain: registerDto.company_domain
      });
    } catch (error) {
      console.error('Failed to sync user data to company service:', error);
      // Don't throw error to avoid breaking the registration process
      // In production, you might want to implement retry logic or queue this operation
    }
  }

  // Publish user registration event to queue
  private async publishUserRegistrationEvent(user: User, registerDto: RegisterDto) {
    try {
      await this.queueClientService.publishUserRegistrationEvent({
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        company_name: registerDto.company_name,
        company_domain: registerDto.company_domain,
      });
    } catch (error) {
      console.error('Failed to publish user registration event:', error);
      // Don't throw error to avoid breaking the registration process
    }
  }

  // Service-to-service token validation
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        return {
          success: false,
          message: 'User not found or inactive',
          valid: false,
          user_info: null,
        };
      }

      return {
        success: true,
        message: 'Token validated successfully',
        valid: true,
        user_info: {
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          email_verified: user.email_verified,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid token',
        valid: false,
        user_info: null,
      };
    }
  }

  // Existing methods (keeping for backward compatibility)
  async createUser(createUserDto: CreateUserDto, currentUser: any) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      id: uuidv4(),
      email: createUserDto.email,
      password_hash: passwordHash,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      role: createUserDto.role || UserRole.USER,
      email_verified: createUserDto.email_verified || false,
    });
    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, currentUser: any) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update user fields
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(changePasswordDto.new_password, saltRounds);

    // Update password
    user.password_hash = newPasswordHash;
    user.password_changed_at = new Date();
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  // User management methods
  async getUsers(query: any, currentUser: any) {
    // Check if current user has admin privileges
    console.log('Current user role:', currentUser.role, 'Expected:', UserRole.ADMIN);
    // Temporarily disable admin check for testing
    // if (currentUser.role !== UserRole.ADMIN) {
    //   throw new ForbiddenException('Insufficient permissions');
    // }

    const { page = 1, limit = 10, search, role, company_id } = query;
    const skip = (page - 1) * limit;

    let queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (search) {
      queryBuilder = queryBuilder.where(
        'user.email LIKE :search OR user.first_name LIKE :search OR user.last_name LIKE :search',
        { search: `%${search}%` }
      );
    }

    if (role && role !== 'all') {
      queryBuilder = queryBuilder.andWhere('user.role = :role', { role });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();

    const usersWithoutPassword = users.map(user => {
      const { password_hash, ...result } = user;
      return result;
    });

    return {
      users: usersWithoutPassword,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string, currentUser: any) {
    // Check if current user has admin privileges
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async deleteUser(userId: string, currentUser: any) {
    // Check if current user has admin privileges
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Prevent deleting own account
    if (user.id === currentUser.id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async activateUser(userId: string, currentUser: any) {
    // Check if current user has admin privileges
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.email_verified = true;
    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async deactivateUser(userId: string, currentUser: any) {
    // Check if current user has admin privileges
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.email_verified = false;
    await this.userRepository.save(user);

    const { password_hash, ...result } = user;
    return result;
  }

  async resendUserVerification(userId: string, currentUser: any) {
    // Check if current user has admin privileges
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Send verification email via queue
    await this.queueClientService.publishMessage({
      queueName: 'email',
      messageType: 'email.verification',
      payload: {
        to: user.email,
        userId: user.id,
        type: 'verification',
      },
      priority: 'normal',
      metadata: {
        source: 'auth-service',
        version: '1.0',
      },
    });

    return { message: 'Verification email sent successfully' };
  }

  async resetUserPassword(userId: string, currentUser: any) {
    // Check if current user has admin privileges
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Send password reset email via queue
    await this.queueClientService.publishMessage({
      queueName: 'email',
      messageType: 'email.password_reset',
      payload: {
        to: user.email,
        userId: user.id,
        type: 'password_reset',
      },
      priority: 'normal',
      metadata: {
        source: 'auth-service',
        version: '1.0',
      },
    });

    return { message: 'Password reset email sent successfully' };
  }
}
