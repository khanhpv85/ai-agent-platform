import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Company } from './entities/company.entity';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { User } from '@modules/users/entities/user.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/companies.dto';
import { CompanyRole } from '@types';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserCompanies(userId: string) {
    const userCompanies = await this.userCompanyRepository.find({
      where: { user_id: userId },
      relations: ['company'],
    });

    return userCompanies.map(uc => ({
      id: uc.company.id,
      name: uc.company.name,
      domain: uc.company.domain,
      subscription_plan: uc.company.subscription_plan,
      max_agents: uc.company.max_agents,
      role: uc.role,
      created_at: uc.company.created_at,
      updated_at: uc.company.updated_at,
    }));
  }

  async getCompany(companyId: string, userId: string) {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: userId },
      relations: ['company'],
    });

    if (!userCompany) {
      throw new NotFoundException('Company not found or access denied');
    }

    return {
      id: userCompany.company.id,
      name: userCompany.company.name,
      domain: userCompany.company.domain,
      subscription_plan: userCompany.company.subscription_plan,
      max_agents: userCompany.company.max_agents,
      role: userCompany.role,
      created_at: userCompany.company.created_at,
      updated_at: userCompany.company.updated_at,
    };
  }

  async createCompany(createCompanyDto: CreateCompanyDto, userId: string) {
    const company = this.companyRepository.create({
      id: uuidv4(),
      name: createCompanyDto.name,
      domain: createCompanyDto.domain,
      subscription_plan: createCompanyDto.subscription_plan,
      max_agents: createCompanyDto.max_agents,
    });

    await this.companyRepository.save(company);

    // Create user-company relationship with owner role
    const userCompany = this.userCompanyRepository.create({
      id: uuidv4(),
      user_id: userId,
      company_id: company.id,
      role: CompanyRole.OWNER,
    });

    await this.userCompanyRepository.save(userCompany);

    return {
      id: company.id,
      name: company.name,
      domain: company.domain,
      subscription_plan: company.subscription_plan,
      max_agents: company.max_agents,
      role: CompanyRole.OWNER,
      created_at: company.created_at,
      updated_at: company.updated_at,
    };
  }

  async updateCompany(companyId: string, updateCompanyDto: UpdateCompanyDto, userId: string) {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: userId },
      relations: ['company'],
    });

    if (!userCompany) {
      throw new NotFoundException('Company not found or access denied');
    }

    // Only owners and admins can update company
    if (![CompanyRole.OWNER, CompanyRole.ADMIN].includes(userCompany.role)) {
      throw new ForbiddenException('Insufficient permissions to update company');
    }

    Object.assign(userCompany.company, updateCompanyDto);
    await this.companyRepository.save(userCompany.company);

    return {
      id: userCompany.company.id,
      name: userCompany.company.name,
      domain: userCompany.company.domain,
      subscription_plan: userCompany.company.subscription_plan,
      max_agents: userCompany.company.max_agents,
      role: userCompany.role,
      created_at: userCompany.company.created_at,
      updated_at: userCompany.company.updated_at,
    };
  }

  async deleteCompany(companyId: string, userId: string) {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: userId },
      relations: ['company'],
    });

    if (!userCompany) {
      throw new NotFoundException('Company not found or access denied');
    }

    // Only owners can delete company
    if (userCompany.role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only company owners can delete the company');
    }

    await this.companyRepository.remove(userCompany.company);

    return { message: 'Company deleted successfully' };
  }
}
