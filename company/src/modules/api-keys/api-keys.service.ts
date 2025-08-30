import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiKey } from './entities/api-key.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { CreateApiKeyDto, UpdateApiKeyDto, ValidateApiKeyDto } from './dto/api-keys.dto';
import { ApiKeyStatus, ApiKeyPermission } from '@types';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
  ) {}

  async getCompanyApiKeys(companyId: string, userId: string) {
    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: companyId }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    const apiKeys = await this.apiKeyRepository.find({
      where: { company_id: companyId },
      order: { created_at: 'DESC' },
    });

    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      prefix: key.key.substring(0, 8) + '...',
      status: key.status,
      permissions: key.permissions,
      last_used_at: key.last_used_at,
      expires_at: key.expires_at,
      created_at: key.created_at,
      updated_at: key.updated_at,
    }));
  }

  async createApiKey(createApiKeyDto: CreateApiKeyDto, userId: string) {
    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: createApiKeyDto.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    // Generate API key
    const apiKey = uuidv4().replace(/-/g, '');
    const hashedKey = await this.hashApiKey(apiKey);

    const newApiKey = this.apiKeyRepository.create({
      id: uuidv4(),
      name: createApiKeyDto.name,
      key: hashedKey, // Store the hashed version
      company_id: createApiKeyDto.company_id,
      created_by: userId,
      permissions: createApiKeyDto.permissions || [ApiKeyPermission.READ],
      status: ApiKeyStatus.ACTIVE,
      expires_at: createApiKeyDto.expires_at ? new Date(createApiKeyDto.expires_at) : null,
    });

    await this.apiKeyRepository.save(newApiKey);

    // Return the full key only once
    return {
      id: newApiKey.id,
      name: newApiKey.name,
      key: apiKey, // Full key for first time
      status: newApiKey.status,
      permissions: newApiKey.permissions,
      expires_at: newApiKey.expires_at,
      created_at: newApiKey.created_at,
    };
  }

  async validateApiKey(validateApiKeyDto: ValidateApiKeyDto) {
    const { api_key } = validateApiKeyDto;
    
    // Hash the provided key
    const hashedKey = await this.hashApiKey(api_key);
    
    // Find the API key
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: hashedKey },
      relations: ['company'],
    });

    if (!apiKey) {
      throw new NotFoundException('Invalid API key');
    }

    // Check if key is active
    if (apiKey.status !== ApiKeyStatus.ACTIVE) {
      throw new ForbiddenException('API key is inactive');
    }

    // Check if key has expired
    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      throw new ForbiddenException('API key has expired');
    }

    // Update last used timestamp
    apiKey.last_used_at = new Date();
    await this.apiKeyRepository.save(apiKey);

    // Get company plan
    const company = await this.companyRepository.findOne({
      where: { id: apiKey.company_id }
    });

    return {
      company_id: apiKey.company_id,
      user_id: apiKey.created_by,
      plan: company?.subscription_plan || 'free',
      permissions: apiKey.permissions,
      internal_token: await this.generateInternalToken(apiKey.company_id),
    };
  }

  async updateApiKey(apiKeyId: string, updateApiKeyDto: UpdateApiKeyDto, userId: string) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
      relations: ['company'],
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: apiKey.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this API key');
    }

    // Update fields
    if (updateApiKeyDto.name) {
      apiKey.name = updateApiKeyDto.name;
    }
    if (updateApiKeyDto.status) {
      apiKey.status = updateApiKeyDto.status;
    }
    if (updateApiKeyDto.permissions) {
      apiKey.permissions = updateApiKeyDto.permissions;
    }
    if (updateApiKeyDto.expires_at) {
      apiKey.expires_at = new Date(updateApiKeyDto.expires_at);
    }

    await this.apiKeyRepository.save(apiKey);

    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.key.substring(0, 8) + '...',
      status: apiKey.status,
      permissions: apiKey.permissions,
      expires_at: apiKey.expires_at,
      updated_at: apiKey.updated_at,
    };
  }

  async deleteApiKey(apiKeyId: string, userId: string) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: apiKey.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this API key');
    }

    await this.apiKeyRepository.remove(apiKey);

    return { message: 'API key deleted successfully' };
  }

  async regenerateApiKey(apiKeyId: string, userId: string) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: apiKey.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this API key');
    }

    // Generate new API key
    const newApiKey = uuidv4().replace(/-/g, '');
    const hashedKey = await this.hashApiKey(newApiKey);

    apiKey.key = hashedKey;
    apiKey.updated_at = new Date();
    await this.apiKeyRepository.save(apiKey);

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: newApiKey, // Full key for regeneration
      status: apiKey.status,
      permissions: apiKey.permissions,
      expires_at: apiKey.expires_at,
      updated_at: apiKey.updated_at,
    };
  }

  private async hashApiKey(apiKey: string): Promise<string> {
    // In production, use a proper hashing library like bcrypt
    // For now, using a simple hash for demonstration
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }



  private async generateInternalToken(companyId: string): Promise<string> {
    // Generate internal JWT token for service-to-service communication
    // This would use your existing JWT service
    const jwt = require('jsonwebtoken');
    const payload = {
      company_id: companyId,
      type: 'internal',
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key');
  }
}
