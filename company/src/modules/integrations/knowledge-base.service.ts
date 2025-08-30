import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from './dto/knowledge-base.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private knowledgeBaseRepository: Repository<KnowledgeBase>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
  ) {}

  async getCompanyKnowledgeBases(companyId: string, userId: string) {
    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: companyId }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    const knowledgeBases = await this.knowledgeBaseRepository.find({
      where: { company_id: companyId },
    });

    return knowledgeBases.map(kb => ({
      id: kb.id,
      name: kb.name,
      description: kb.description,
      source_type: kb.source_type,
      source_config: kb.source_config,
      is_active: kb.is_active,
      company_id: kb.company_id,
      created_at: kb.created_at,
      updated_at: kb.updated_at,
    }));
  }

  async getKnowledgeBase(knowledgeBaseId: string, userId: string) {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id: knowledgeBaseId },
    });

    if (!knowledgeBase) {
      throw new NotFoundException('Knowledge base not found');
    }

    // Check if user has access to this knowledge base's company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: knowledgeBase.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this knowledge base');
    }

    return {
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      description: knowledgeBase.description,
      source_type: knowledgeBase.source_type,
      source_config: knowledgeBase.source_config,
      is_active: knowledgeBase.is_active,
      company_id: knowledgeBase.company_id,
      created_at: knowledgeBase.created_at,
      updated_at: knowledgeBase.updated_at,
    };
  }

  async createKnowledgeBase(createKnowledgeBaseDto: CreateKnowledgeBaseDto, userId: string) {
    // Check if user has access to this company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: createKnowledgeBaseDto.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    const knowledgeBase = this.knowledgeBaseRepository.create({
      id: uuidv4(),
      name: createKnowledgeBaseDto.name,
      description: createKnowledgeBaseDto.description,
      company_id: createKnowledgeBaseDto.company_id,
      source_type: createKnowledgeBaseDto.source_type,
      source_config: createKnowledgeBaseDto.source_config,
      is_active: createKnowledgeBaseDto.is_active !== false, // Default to true
    });

    await this.knowledgeBaseRepository.save(knowledgeBase);

    return {
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      description: knowledgeBase.description,
      source_type: knowledgeBase.source_type,
      source_config: knowledgeBase.source_config,
      is_active: knowledgeBase.is_active,
      company_id: knowledgeBase.company_id,
      created_at: knowledgeBase.created_at,
      updated_at: knowledgeBase.updated_at,
    };
  }

  async updateKnowledgeBase(knowledgeBaseId: string, updateKnowledgeBaseDto: UpdateKnowledgeBaseDto, userId: string) {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id: knowledgeBaseId },
    });

    if (!knowledgeBase) {
      throw new NotFoundException('Knowledge base not found');
    }

    // Check if user has access to this knowledge base's company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: knowledgeBase.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this knowledge base');
    }

    Object.assign(knowledgeBase, updateKnowledgeBaseDto);
    await this.knowledgeBaseRepository.save(knowledgeBase);

    return {
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      description: knowledgeBase.description,
      source_type: knowledgeBase.source_type,
      source_config: knowledgeBase.source_config,
      is_active: knowledgeBase.is_active,
      company_id: knowledgeBase.company_id,
      created_at: knowledgeBase.created_at,
      updated_at: knowledgeBase.updated_at,
    };
  }

  async deleteKnowledgeBase(knowledgeBaseId: string, userId: string) {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id: knowledgeBaseId },
    });

    if (!knowledgeBase) {
      throw new NotFoundException('Knowledge base not found');
    }

    // Check if user has access to this knowledge base's company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: knowledgeBase.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this knowledge base');
    }

    await this.knowledgeBaseRepository.remove(knowledgeBase);

    return { message: 'Knowledge base deleted successfully' };
  }

  async toggleKnowledgeBaseStatus(knowledgeBaseId: string, userId: string) {
    const knowledgeBase = await this.knowledgeBaseRepository.findOne({
      where: { id: knowledgeBaseId },
    });

    if (!knowledgeBase) {
      throw new NotFoundException('Knowledge base not found');
    }

    // Check if user has access to this knowledge base's company
    const userCompany = await this.userCompanyRepository.findOne({
      where: { user_id: userId, company_id: knowledgeBase.company_id }
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this knowledge base');
    }

    knowledgeBase.is_active = !knowledgeBase.is_active;
    await this.knowledgeBaseRepository.save(knowledgeBase);

    return {
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      is_active: knowledgeBase.is_active,
      updated_at: knowledgeBase.updated_at,
    };
  }
}
