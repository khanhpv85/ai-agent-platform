import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Integration } from './entities/integration.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { CreateIntegrationDto, UpdateIntegrationDto } from './dto/integrations.dto';
import { IntegrationType } from '@types';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getCompanyIntegrations(companyId: string, userId: string) {
    // Check if user has access to this company
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['userCompanies'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const hasAccess = company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this company');
    }

    const integrations = await this.integrationRepository.find({
      where: { company_id: companyId },
    });

    return integrations.map(integration => ({
      id: integration.id,
      name: integration.name,
      type: integration.type,
      is_active: integration.is_active,
      created_at: integration.created_at,
      updated_at: integration.updated_at,
    }));
  }

  async getIntegration(integrationId: string, userId: string) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const hasAccess = integration.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this integration');
    }

    return {
      id: integration.id,
      name: integration.name,
      type: integration.type,
      configuration: integration.configuration,
      is_active: integration.is_active,
      company_id: integration.company_id,
      created_at: integration.created_at,
      updated_at: integration.updated_at,
    };
  }

  async createIntegration(createIntegrationDto: CreateIntegrationDto, userId: string) {
    // Check if user has access to this company
    const company = await this.companyRepository.findOne({
      where: { id: createIntegrationDto.company_id },
      relations: ['userCompanies'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const hasAccess = company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this company');
    }

    const integration = this.integrationRepository.create({
      id: uuidv4(),
      name: createIntegrationDto.name,
      type: createIntegrationDto.type,
      company_id: createIntegrationDto.company_id,
      configuration: createIntegrationDto.configuration,
      is_active: createIntegrationDto.is_active !== false, // Default to true
    });

    await this.integrationRepository.save(integration);

    return {
      id: integration.id,
      name: integration.name,
      type: integration.type,
      configuration: integration.configuration,
      is_active: integration.is_active,
      company_id: integration.company_id,
      created_at: integration.created_at,
      updated_at: integration.updated_at,
    };
  }

  async updateIntegration(integrationId: string, updateIntegrationDto: UpdateIntegrationDto, userId: string) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const hasAccess = integration.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this integration');
    }

    Object.assign(integration, updateIntegrationDto);
    await this.integrationRepository.save(integration);

    return {
      id: integration.id,
      name: integration.name,
      type: integration.type,
      configuration: integration.configuration,
      is_active: integration.is_active,
      company_id: integration.company_id,
      created_at: integration.created_at,
      updated_at: integration.updated_at,
    };
  }

  async deleteIntegration(integrationId: string, userId: string) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const hasAccess = integration.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this integration');
    }

    await this.integrationRepository.remove(integration);

    return { message: 'Integration deleted successfully' };
  }

  async testIntegration(integrationId: string, userId: string) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId },
      relations: ['company', 'company.userCompanies'],
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const hasAccess = integration.company.userCompanies.some(uc => uc.user_id === userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this integration');
    }

    try {
      if (!integration) {
        throw new Error('Integration is null or undefined');
      }
      
      if (!integration.type) {
        throw new Error('Integration type is missing');
      }
      
      switch (integration.type) {
        case IntegrationType.SLACK:
          return await this.testSlackIntegration(integration);
        case IntegrationType.EMAIL:
          return await this.testEmailIntegration(integration);
        case IntegrationType.CALENDAR:
          return await this.testCalendarIntegration(integration);
        case IntegrationType.CRM:
          return await this.testCRMIntegration(integration);
        case IntegrationType.CUSTOM:
          return await this.testCustomIntegration(integration);
        default:
          throw new Error(`Unknown integration type: ${integration.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async testSlackIntegration(integration: Integration) {
    const webhookUrl = integration.configuration.webhook_url;
    
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    const testMessage = {
      text: 'Test message from AI Agent Platform',
      attachments: [
        {
          color: 'good',
          title: 'Integration Test',
          text: 'This is a test message to verify the Slack integration is working correctly.',
          footer: 'AI Agent Platform',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await axios.post(webhookUrl, testMessage);
    
    if (response.status === 200) {
      return {
        success: true,
        message: 'Slack integration test successful',
      };
    } else {
      throw new Error(`Slack API returned status ${response.status}`);
    }
  }

  private async testEmailIntegration(integration: Integration) {
    // This would typically use SendGrid or similar email service
    const apiKey = integration.configuration.api_key;
    
    if (!apiKey) {
      throw new Error('Email API key not configured');
    }

    // For now, just validate the configuration
    return {
      success: true,
      message: 'Email integration configuration is valid',
    };
  }

  private async testCalendarIntegration(integration: Integration) {
    const apiKey = integration.configuration.api_key;
    
    if (!apiKey) {
      throw new Error('Calendar API key not configured');
    }

    // This would typically test Google Calendar API
    return {
      success: true,
      message: 'Calendar integration configuration is valid',
    };
  }

  private async testCRMIntegration(integration: Integration) {
    const apiKey = integration.configuration.api_key;
    const baseUrl = integration.configuration.base_url;
    
    if (!apiKey || !baseUrl) {
      throw new Error('CRM API key or base URL not configured');
    }

    // Test the CRM API endpoint
    const response = await axios.get(`${baseUrl}/api/v1/contacts`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        message: 'CRM integration test successful',
      };
    } else {
      throw new Error(`CRM API returned status ${response.status}`);
    }
  }

  private async testCustomIntegration(integration: Integration) {
    const url = integration.configuration.url;
    const method = integration.configuration.method || 'GET';
    const headers = integration.configuration.headers || {};
    
    if (!url) {
      throw new Error('Custom integration URL not configured');
    }

    const response = await axios({
      method,
      url,
      headers,
      data: integration.configuration.test_data,
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: 'Custom integration test successful',
      };
    } else {
      throw new Error(`Custom API returned status ${response.status}`);
    }
  }
}
