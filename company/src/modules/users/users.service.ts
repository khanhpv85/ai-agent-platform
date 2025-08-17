import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { UserCompany } from './entities/user-company.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { CompanyRole } from '@types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserCompany)
    private userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async getCompanyUsers(companyId: string, currentUserId: string) {
    // Check if current user has access to this company
    const currentUserCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: currentUserId },
    });

    if (!currentUserCompany) {
      throw new NotFoundException('Company not found or access denied');
    }

    const userCompanies = await this.userCompanyRepository.find({
      where: { company_id: companyId },
      relations: ['user'],
    });

    return userCompanies.map(uc => ({
      id: uc.user.id,
      email: uc.user.email,
      first_name: uc.user.first_name,
      last_name: uc.user.last_name,
      role: uc.user.role,
      company_role: uc.role,
      is_active: uc.user.is_active,
      created_at: uc.user.created_at,
    }));
  }

  async getUser(userId: string, currentUserId: string) {
    // Check if current user has access to view this user
    const currentUserCompanies = await this.userCompanyRepository.find({
      where: { user_id: currentUserId },
    });

    const targetUserCompanies = await this.userCompanyRepository.find({
      where: { user_id: userId },
    });

    // Check if they share any companies
    const sharedCompanies = currentUserCompanies.filter(uc1 =>
      targetUserCompanies.some(uc2 => uc2.company_id === uc1.company_id)
    );

    if (sharedCompanies.length === 0) {
      throw new NotFoundException('User not found or access denied');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  async addUserToCompany(companyId: string, createUserDto: CreateUserDto, currentUserId: string) {
    // Check if current user has admin/owner permissions in this company
    const currentUserCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: currentUserId },
    });

    if (!currentUserCompany) {
      throw new NotFoundException('Company not found or access denied');
    }

    if (![CompanyRole.OWNER, CompanyRole.ADMIN].includes(currentUserCompany.role)) {
      throw new ForbiddenException('Insufficient permissions to add users');
    }

    // Check if user already exists
    let user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (!user) {
      // Create new user profile (no password handling in company service)
      user = this.userRepository.create({
        id: uuidv4(),
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: createUserDto.role,
      });

      await this.userRepository.save(user);
    }

    // Check if user is already in this company
    const existingUserCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: user.id },
    });

    if (existingUserCompany) {
      throw new ConflictException('User is already a member of this company');
    }

    // Add user to company
    const userCompany = this.userCompanyRepository.create({
      id: uuidv4(),
      user_id: user.id,
      company_id: companyId,
      role: createUserDto.company_role || CompanyRole.MEMBER,
    });

    await this.userCompanyRepository.save(userCompany);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      company_role: userCompany.role,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, currentUserId: string) {
    // Check if current user has access to update this user
    const currentUserCompanies = await this.userCompanyRepository.find({
      where: { user_id: currentUserId },
    });

    const targetUserCompanies = await this.userCompanyRepository.find({
      where: { user_id: userId },
    });

    // Check if they share any companies and current user has admin/owner role
    const sharedCompanies = currentUserCompanies.filter(uc1 =>
      targetUserCompanies.some(uc2 => uc2.company_id === uc1.company_id) &&
      [CompanyRole.OWNER, CompanyRole.ADMIN].includes(uc1.role)
    );

    if (sharedCompanies.length === 0) {
      throw new ForbiddenException('Insufficient permissions to update user');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  async removeUserFromCompany(companyId: string, userId: string, currentUserId: string) {
    // Check if current user has admin/owner permissions in this company
    const currentUserCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: currentUserId },
    });

    if (!currentUserCompany) {
      throw new NotFoundException('Company not found or access denied');
    }

    if (![CompanyRole.OWNER, CompanyRole.ADMIN].includes(currentUserCompany.role)) {
      throw new ForbiddenException('Insufficient permissions to remove users');
    }

    // Prevent removing the last owner
    if (userId === currentUserId && currentUserCompany.role === CompanyRole.OWNER) {
      const ownerCount = await this.userCompanyRepository.count({
        where: { company_id: companyId, role: CompanyRole.OWNER },
      });

      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot remove the last owner from the company');
      }
    }

    const userCompany = await this.userCompanyRepository.findOne({
      where: { company_id: companyId, user_id: userId },
    });

    if (!userCompany) {
      throw new NotFoundException('User is not a member of this company');
    }

    await this.userCompanyRepository.remove(userCompany);

    return { message: 'User removed from company successfully' };
  }
}
