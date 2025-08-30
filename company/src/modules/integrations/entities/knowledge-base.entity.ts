import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';

export enum SourceType {
  DOCUMENT = 'document',
  DATABASE = 'database',
  API = 'api',
  WEBSITE = 'website',
  FILE = 'file'
}

@Entity('knowledge_bases')
export class KnowledgeBase {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 36 })
  company_id: string;

  @Column({
    type: 'enum',
    enum: SourceType,
    default: SourceType.DOCUMENT,
  })
  source_type: SourceType;

  @Column('json', { nullable: true })
  source_config: any;

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
