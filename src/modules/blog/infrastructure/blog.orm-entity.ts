import { Column, Entity, Index } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

@Entity('blogs')
@Index('IDX_blogs_name', ['name'])
@Index('IDX_blogs_created_at', ['createdAt'])
export class BlogOrmEntity extends BaseOrmEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'website_url', type: 'varchar' })
  websiteUrl: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ name: 'is_membership', type: 'boolean', default: false })
  isMembership: boolean;
}
