import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserCompany } from '@modules/users/entities/user-company.entity';
import { ApiKey } from '@modules/api-keys/entities/api-key.entity';
import { SubscriptionPlan } from '@types';

@Entity('companies')
export class Company {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 255, unique: true, nullable: true })
  domain: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscription_plan: SubscriptionPlan;

  @Column('int', { default: 5 })
  max_agents: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserCompany, userCompany => userCompany.company)
  userCompanies: UserCompany[];

  @OneToMany(() => ApiKey, apiKey => apiKey.company)
  apiKeys: ApiKey[];
}
