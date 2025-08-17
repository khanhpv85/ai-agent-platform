import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  user_id: string;

  @Column('varchar', { length: 255 })
  session_token: string;

  @Column('varchar', { length: 500 })
  refresh_token: string;

  @Column('timestamp')
  expires_at: Date;

  @Column('timestamp')
  refresh_expires_at: Date;

  @Column('boolean', { default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  last_activity_at: Date;

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string;

  @Column('text', { nullable: true })
  user_agent: string;

  @Column('json', { nullable: true })
  device_info: any;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Method to check if session is valid
  isValid(): boolean {
    return this.is_active && this.expires_at > new Date();
  }

  // Method to check if refresh token is valid
  isRefreshValid(): boolean {
    return this.is_active && this.refresh_expires_at > new Date();
  }

  // Method to update last activity
  updateActivity(): void {
    this.last_activity_at = new Date();
  }

  // Method to deactivate session
  deactivate(): void {
    this.is_active = false;
  }
}
