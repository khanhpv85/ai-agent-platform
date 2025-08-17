import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';
import { User } from '@modules/users/entities/user.entity';
import { AgentStatus, AgentType } from '@types';

@Entity('agents')
export class Agent {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 36 })
  company_id: string;

  @Column('varchar', { length: 36 })
  created_by: string;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.DRAFT,
  })
  status: AgentStatus;

  @Column({
    type: 'enum',
    enum: AgentType,
    default: AgentType.WORKFLOW,
  })
  agent_type: AgentType;

  @Column('json', { nullable: true })
  configuration: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Company, company => company.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
