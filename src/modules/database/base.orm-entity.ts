import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'public_id', type: 'uuid', unique: true })
  publicId: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
