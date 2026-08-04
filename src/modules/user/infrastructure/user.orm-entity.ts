import { Column, Entity, Index } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

@Entity('users')
@Index('IDX_users_created_at', ['createdAt'])
@Index('UQ_users_recovery_code_partial', ['recoveryCode'], {
  unique: true,
  where: '"recovery_code" IS NOT NULL',
})
export class UserOrmEntity extends BaseOrmEntity {
  @Column({ type: 'varchar', unique: true })
  login: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ name: 'confirmation_code', type: 'varchar', unique: true, nullable: true })
  confirmationCode: string | null;

  @Column({ name: 'confirmation_expiration', type: 'timestamptz', nullable: true })
  confirmationExpiration: Date | null;

  @Column({ name: 'is_confirmed', type: 'boolean' })
  isConfirmed: boolean;

  @Column({ name: 'recovery_code', type: 'varchar', nullable: true })
  recoveryCode: string | null;

  @Column({ name: 'recovery_expiration', type: 'timestamptz', nullable: true })
  recoveryExpiration: Date | null;
}
