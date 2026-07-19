import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class SessionOrmEntity {
  @PrimaryColumn({ name: 'device_id', type: 'varchar' })
  deviceId: string;

  @Column({ name: 'user_id', type: 'uuid' })
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
