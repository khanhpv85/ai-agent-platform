import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('service_tokens')
export class ServiceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  token_hash: string;

  @Column()
  client_id: string;

  @Column('simple-array')
  scopes: string[];

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date;

  @Column({ nullable: true })
  revoked_reason: string;

  @CreateDateColumn()
  created_at: Date;

  // Helper methods
  isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  isRevoked(): boolean {
    return this.revoked_at !== null;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }
}
