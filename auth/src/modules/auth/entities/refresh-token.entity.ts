import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  user_id: string;

  @Column('varchar', { length: 500 })
  token: string;

  @Column('timestamp')
  expires_at: Date;

  @Column('boolean', { default: false })
  is_revoked: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column('varchar', { length: 45, nullable: true })
  created_ip: string;

  @Column('text', { nullable: true })
  user_agent: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Method to check if token is valid
  isValid(): boolean {
    return !this.is_revoked && this.expires_at > new Date();
  }

  // Method to revoke token
  revoke(): void {
    this.is_revoked = true;
  }
}
