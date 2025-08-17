import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';
import { IntegrationType } from '../../../types/integration.types';

@Entity('integrations')
export class Integration {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: IntegrationType,
  })
  type: IntegrationType;

  @Column('varchar', { length: 36 })
  company_id: string;

  @Column('json')
  configuration: any;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Company, company => company.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
