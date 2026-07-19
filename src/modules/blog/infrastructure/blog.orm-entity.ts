import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('blogs')
export class BlogOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'website_url', type: 'varchar' })
  websiteUrl: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ name: 'is_membership', type: 'boolean', default: false })
  isMembership: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
