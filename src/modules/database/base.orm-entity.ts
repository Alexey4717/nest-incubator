import { Column, PrimaryColumn } from 'typeorm';

export abstract class BaseOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
