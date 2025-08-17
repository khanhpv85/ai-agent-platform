import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { ClientCredential } from './entities/client-credential.entity';
import { ServiceToken } from './entities/service-token.entity';
import {
  ClientCredentialsTokenDto,
  TokenResponseDto,
  TokenIntrospectionDto,
  TokenIntrospectionResponseDto,
  CreateClientCredentialDto,
  UpdateClientCredentialDto,
  RevokeTokenDto,
} from './dto/oauth.dto';

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(ClientCredential)
    private clientCredentialRepository: Repository<ClientCredential>,
    @InjectRepository(ServiceToken)
    private serviceTokenRepository: Repository<ServiceToken>,
    private jwtService: JwtService,
  ) {}

  /**
   * Generate client credentials (client_id and client_secret)
   */
  async generateClientCredentials(): Promise<{ client_id: string; client_secret: string }> {
    const client_id = `client_${crypto.randomBytes(16).toString('hex')}`;
    const client_secret = crypto.randomBytes(32).toString('hex');
    
    return { client_id, client_secret };
  }

  /**
   * Create a new client credential
   */
  async createClientCredential(createDto: CreateClientCredentialDto, currentUser: any) {
    // Only admins can create client credentials
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const { client_id, client_secret } = await this.generateClientCredentials();
    const client_secret_hash = await bcrypt.hash(client_secret, 12);

    const clientCredential = this.clientCredentialRepository.create({
      id: uuidv4(),
      client_id,
      client_secret_hash,
      client_name: createDto.client_name,
      description: createDto.description,
      scopes: createDto.scopes || ['read'],
      expires_at: createDto.expires_at ? new Date(createDto.expires_at) : null,
    });

    await this.clientCredentialRepository.save(clientCredential);

    return {
      id: clientCredential.id,
      client_id,
      client_secret, // Only returned once during creation
      client_name: clientCredential.client_name,
      description: clientCredential.description,
      scopes: clientCredential.scopes,
      expires_at: clientCredential.expires_at,
      created_at: clientCredential.created_at,
    };
  }

  /**
   * Validate client credentials and issue access token
   */
  async issueToken(tokenDto: ClientCredentialsTokenDto): Promise<TokenResponseDto> {
    if (tokenDto.grant_type !== 'client_credentials') {
      throw new BadRequestException('Invalid grant type');
    }

    // Find and validate client credentials
    const clientCredential = await this.clientCredentialRepository.findOne({
      where: { client_id: tokenDto.client_id },
    });

    if (!clientCredential || !clientCredential.isValid()) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Verify client secret
    const isSecretValid = await bcrypt.compare(tokenDto.client_secret, clientCredential.client_secret_hash);
    if (!isSecretValid) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Update last used timestamp
    clientCredential.last_used_at = new Date();
    await this.clientCredentialRepository.save(clientCredential);

    // Generate access token
    const tokenExpiresIn = 3600; // 1 hour
    const expiresAt = new Date(Date.now() + tokenExpiresIn * 1000);
    
    const tokenPayload = {
      sub: clientCredential.client_id,
      client_id: clientCredential.client_id,
      scopes: tokenDto.scope ? tokenDto.scope.split(' ') : clientCredential.scopes,
      type: 'service',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    const accessToken = this.jwtService.sign(tokenPayload);

    // Store token hash for revocation tracking
    const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const serviceToken = this.serviceTokenRepository.create({
      id: uuidv4(),
      token_hash: tokenHash,
      client_id: clientCredential.client_id,
      scopes: tokenPayload.scopes,
      expires_at: expiresAt,
    });
    await this.serviceTokenRepository.save(serviceToken);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: tokenExpiresIn,
      scope: tokenPayload.scopes.join(' '),
    };
  }

  /**
   * Introspect a token to get its details
   */
  async introspectToken(introspectDto: TokenIntrospectionDto): Promise<TokenIntrospectionResponseDto> {
    try {
      // Verify JWT token
      const payload = this.jwtService.verify(introspectDto.token);
      
      if (payload.type !== 'service') {
        return { active: false };
      }

      // Check if token is revoked
      const tokenHash = crypto.createHash('sha256').update(introspectDto.token).digest('hex');
      const serviceToken = await this.serviceTokenRepository.findOne({
        where: { token_hash: tokenHash },
      });

      if (!serviceToken || !serviceToken.isValid()) {
        return { active: false };
      }

      // Check if client is still valid
      const clientCredential = await this.clientCredentialRepository.findOne({
        where: { client_id: payload.client_id },
      });

      if (!clientCredential || !clientCredential.isValid()) {
        return { active: false };
      }

      return {
        active: true,
        client_id: payload.client_id,
        scope: payload.scopes.join(' '),
        exp: payload.exp,
        iat: payload.iat,
        sub: payload.sub,
        aud: payload.aud,
        iss: payload.iss,
        jti: payload.jti,
      };
    } catch (error) {
      return { active: false };
    }
  }

  /**
   * Revoke a service token
   */
  async revokeToken(revokeDto: RevokeTokenDto, currentUser: any) {
    // Only admins can revoke tokens
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const tokenHash = crypto.createHash('sha256').update(revokeDto.token).digest('hex');
    const serviceToken = await this.serviceTokenRepository.findOne({
      where: { token_hash: tokenHash },
    });

    if (!serviceToken) {
      throw new BadRequestException('Token not found');
    }

    serviceToken.revoked_at = new Date();
    serviceToken.revoked_reason = revokeDto.reason || 'Admin revoked';
    await this.serviceTokenRepository.save(serviceToken);

    return { message: 'Token revoked successfully' };
  }

  /**
   * Get all client credentials (admin only)
   */
  async getClientCredentials(currentUser: any) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const clientCredentials = await this.clientCredentialRepository.find({
      order: { created_at: 'DESC' },
    });

    return clientCredentials.map(cred => ({
      id: cred.id,
      client_id: cred.client_id,
      client_name: cred.client_name,
      description: cred.description,
      scopes: cred.scopes,
      is_active: cred.is_active,
      expires_at: cred.expires_at,
      last_used_at: cred.last_used_at,
      created_at: cred.created_at,
    }));
  }

  /**
   * Update client credential
   */
  async updateClientCredential(
    clientId: string,
    updateDto: UpdateClientCredentialDto,
    currentUser: any
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const clientCredential = await this.clientCredentialRepository.findOne({
      where: { client_id: clientId },
    });

    if (!clientCredential) {
      throw new BadRequestException('Client credential not found');
    }

    Object.assign(clientCredential, updateDto);
    if (updateDto.expires_at) {
      clientCredential.expires_at = new Date(updateDto.expires_at);
    }

    await this.clientCredentialRepository.save(clientCredential);

    return {
      id: clientCredential.id,
      client_id: clientCredential.client_id,
      client_name: clientCredential.client_name,
      description: clientCredential.description,
      scopes: clientCredential.scopes,
      is_active: clientCredential.is_active,
      expires_at: clientCredential.expires_at,
      updated_at: clientCredential.updated_at,
    };
  }

  /**
   * Delete client credential
   */
  async deleteClientCredential(clientId: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const clientCredential = await this.clientCredentialRepository.findOne({
      where: { client_id: clientId },
    });

    if (!clientCredential) {
      throw new BadRequestException('Client credential not found');
    }

    // Revoke all tokens for this client
    await this.serviceTokenRepository.update(
      { client_id: clientId },
      { 
        revoked_at: new Date(),
        revoked_reason: 'Client credential deleted'
      }
    );

    await this.clientCredentialRepository.remove(clientCredential);

    return { message: 'Client credential deleted successfully' };
  }

  /**
   * Validate service token (for internal use)
   */
  async validateServiceToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'service') {
        return { valid: false, message: 'Invalid token type' };
      }

      // Check if token is revoked
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const serviceToken = await this.serviceTokenRepository.findOne({
        where: { token_hash: tokenHash },
      });

      if (!serviceToken || !serviceToken.isValid()) {
        return { valid: false, message: 'Token revoked or expired' };
      }

      // Check if client is still valid
      const clientCredential = await this.clientCredentialRepository.findOne({
        where: { client_id: payload.client_id },
      });

      if (!clientCredential || !clientCredential.isValid()) {
        return { valid: false, message: 'Client credential invalid' };
      }

      return {
        valid: true,
        client_id: payload.client_id,
        scopes: payload.scopes,
        user_info: {
          client_id: payload.client_id,
          client_name: clientCredential.client_name,
          scopes: payload.scopes,
        },
      };
    } catch (error) {
      return { valid: false, message: 'Invalid token' };
    }
  }
}
