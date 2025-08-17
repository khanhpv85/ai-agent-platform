import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Workflow } from './workflow.entity';
import { ExecutionStatus } from '../../../types/workflow.types';

@Entity('workflow_executions')
export class WorkflowExecution {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  workflow_id: string;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Column('json', { nullable: true })
  input_data: any;

  @Column('json', { nullable: true })
  output_data: any;

  @Column('text', { nullable: true })
  error_message: string;

  @Column('timestamp', { nullable: true })
  started_at: Date;

  @Column('timestamp', { nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Workflow, workflow => workflow.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: Workflow;
}
