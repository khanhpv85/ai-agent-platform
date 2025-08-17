import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserCompany } from './user-company.entity';
import { UserRole } from '../../../types/user.types';

@Entity('user_profiles')
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('varchar', { length: 100 })
  first_name: string;

  @Column('varchar', { length: 100 })
  last_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserCompany, userCompany => userCompany.user)
  userCompanies: UserCompany[];

  // Virtual property for full name
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
