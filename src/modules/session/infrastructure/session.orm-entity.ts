import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('sessions')
@Index('IDX_sessions_user_id', ['userId'])
@Index('IDX_sessions_last_active_date', ['lastActiveDate'])
export class SessionOrmEntity {
  @PrimaryColumn({ name: 'device_id', type: 'varchar' })
  deviceId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'last_active_date', type: 'timestamptz' })
  lastActiveDate: Date;

  @Column({ name: 'current_refresh_token_jti', type: 'varchar' })
  currentRefreshTokenJti: string;
}
