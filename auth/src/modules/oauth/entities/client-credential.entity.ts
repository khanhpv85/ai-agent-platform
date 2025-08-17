import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('client_credentials')
export class ClientCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  client_id: string;

  @Column()
  client_secret_hash: string;

  @Column()
  client_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array', { default: [] })
  scopes: string[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Helper methods
  isExpired(): boolean {
    return this.expires_at ? new Date() > this.expires_at : false;
  }

  isValid(): boolean {
    return this.is_active && !this.isExpired();
  }

  hasScope(scope: string): boolean {
    return this.scopes.includes(scope) || this.scopes.includes('*');
  }
}
