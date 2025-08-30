import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';
import { ApiKeyStatus, ApiKeyPermission } from '@types';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  key: string; // Hashed API key

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE
  })
  status: ApiKeyStatus;

  @Column({
    type: 'json',
    default: [ApiKeyPermission.READ]
  })
  permissions: ApiKeyPermission[];

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Company, company => company.apiKeys)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
