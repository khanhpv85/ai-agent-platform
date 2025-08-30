import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from './entities/agent.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { CreateAgentDto, UpdateAgentDto, UpdateLLMConfigDto, UpdateKnowledgeBaseConfigDto } from './dto/agents.dto';
import { AgentStatus, AgentType } from '@types';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
  ) {}

  async getCompanyAgents(companyId: string, userId: string) {
    // Check if user has access to this company
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const agents = await this.agentRepository.find({
      where: { company_id: companyId },
      relations: ['creator'],
    });

    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      agent_type: agent.agent_type,
      configuration: agent.configuration,
      created_by: agent.creator.fullName,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    }));
  }

  async getAgent(agentId: string, userId: string) {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['company', 'creator'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      agent_type: agent.agent_type,
      configuration: agent.configuration,
      company_id: agent.company_id,
      created_by: agent.creator.fullName,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    };
  }

  async createAgent(createAgentDto: CreateAgentDto, userId: string) {
    // Check if user has access to this company
    const company = await this.companyRepository.findOne({
      where: { id: createAgentDto.company_id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check agent limit for company
    const agentCount = await this.agentRepository.count({
      where: { company_id: createAgentDto.company_id },
    });

    if (agentCount >= company.max_agents) {
      throw new ForbiddenException(`Company has reached the maximum number of agents (${company.max_agents})`);
    }

    const agent = this.agentRepository.create({
      id: uuidv4(),
      name: createAgentDto.name,
      description: createAgentDto.description,
      company_id: createAgentDto.company_id,
      created_by: userId,
      status: createAgentDto.status || AgentStatus.DRAFT,
      agent_type: createAgentDto.agent_type || AgentType.WORKFLOW,
      configuration: createAgentDto.configuration,
    });

    await this.agentRepository.save(agent);

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      agent_type: agent.agent_type,
      configuration: agent.configuration,
      company_id: agent.company_id,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    };
  }

  async updateAgent(agentId: string, updateAgentDto: UpdateAgentDto, userId: string) {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['company'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    Object.assign(agent, updateAgentDto);
    await this.agentRepository.save(agent);

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      agent_type: agent.agent_type,
      configuration: agent.configuration,
      company_id: agent.company_id,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    };
  }

  async updateLLMConfiguration(agentId: string, llmConfig: UpdateLLMConfigDto, userId: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId }, relations: ['company'] });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check if user has access to this agent's company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: agent.company_id }
    });
    if (!userCompany) {
      throw new ForbiddenException('Access denied');
    }

    // Get current configuration or initialize empty object
    const currentConfig = agent.configuration || {};
    
    // Update only the LLM configuration section
    const updatedConfig = {
      ...currentConfig,
      llm: { ...currentConfig.llm, ...llmConfig }
    };

    agent.configuration = updatedConfig;
    await this.agentRepository.save(agent);

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      agent_type: agent.agent_type,
      configuration: agent.configuration,
      created_at: agent.created_at,
      updated_at: agent.updated_at
    };
  }

  async updateKnowledgeBaseConfiguration(agentId: string, knowledgeBaseConfig: UpdateKnowledgeBaseConfigDto, userId: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId }, relations: ['company'] });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Check if user has access to this agent's company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: agent.company_id }
    });
    if (!userCompany) {
      throw new ForbiddenException('Access denied');
    }

    // Get current configuration or initialize empty object
    const currentConfig = agent.configuration || {};
    
    // Update only the knowledge base configuration section
    const updatedConfig = {
      ...currentConfig,
      knowledge_bases: knowledgeBaseConfig.knowledge_bases
    };

    agent.configuration = updatedConfig;
    await this.agentRepository.save(agent);

    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      agent_type: agent.agent_type,
      configuration: agent.configuration,
      created_at: agent.created_at,
      updated_at: agent.updated_at
    };
  }

  async deleteAgent(agentId: string, userId: string) {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    await this.agentRepository.remove(agent);

    return { message: 'Agent deleted successfully' };
  }
}
