import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole, UserAuthStatus } from '@types';

@Entity('users')
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('varchar', { length: 255 })
  password_hash: string;

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

  // New auth-related fields
  @Column('varchar', { length: 500, nullable: true })
  refresh_token: string;

  @Column('timestamp', { nullable: true })
  refresh_token_expires_at: Date;

  @Column('timestamp', { nullable: true })
  last_login_at: Date;

  @Column('int', { default: 0 })
  login_attempts: number;

  @Column('timestamp', { nullable: true })
  locked_until: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  password_changed_at: Date;

  @Column('boolean', { default: false })
  email_verified: boolean;

  @Column('varchar', { length: 255, nullable: true })
  email_verification_token: string;

  @Column('timestamp', { nullable: true })
  email_verification_expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Virtual property for full name
  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  // Virtual property for auth status
  get authStatus(): string {
    if (this.locked_until && this.locked_until > new Date()) {
      return 'locked';
    }
    if (this.login_attempts >= 5) {
      return 'suspicious';
    }
    if (!this.email_verified) {
      return 'unverified';
    }
    return 'active';
  }

  // Method to check if account is locked
  isLocked(): boolean {
    return this.locked_until !== null && this.locked_until > new Date();
  }

  // Method to check if refresh token is valid
  isRefreshTokenValid(): boolean {
    return this.refresh_token !== null && 
           this.refresh_token_expires_at !== null && 
           this.refresh_token_expires_at > new Date();
  }
}
