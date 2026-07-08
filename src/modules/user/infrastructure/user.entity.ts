import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  login: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

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
