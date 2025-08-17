import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Agent } from '@modules/agents/entities/agent.entity';
import { User } from '@modules/users/entities/user.entity';
import { WorkflowStatus } from '../../../types/workflow.types';

@Entity('workflows')
export class Workflow {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 36 })
  agent_id: string;

  @Column('varchar', { length: 36 })
  created_by: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column('json')
  steps: any;

  @Column('json', { nullable: true })
  triggers: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Agent, agent => agent.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
