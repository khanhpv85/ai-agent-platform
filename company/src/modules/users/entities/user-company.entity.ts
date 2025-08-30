import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Company } from '@modules/companies/entities/company.entity';
import { CompanyRole } from '../../../types/company.types';

@Entity('user_companies')
export class UserCompany {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  user_id: string;

  @Column('varchar', { length: 36 })
  company_id: string;

  @Column({
    type: 'enum',
    enum: CompanyRole,
    default: CompanyRole.MEMBER,
  })
  role: CompanyRole;

  @Column('boolean', { default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.userCompanies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, company => company.userCompanies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
