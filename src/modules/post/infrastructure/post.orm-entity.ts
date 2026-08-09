import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

import { PostReactionOrmEntity } from './post-reaction.orm-entity';

@Entity('posts')
@Index('IDX_posts_blog_id_created_at', ['blogId', 'createdAt'])
export class PostOrmEntity extends BaseOrmEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'short_description', type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'blog_id', type: 'bigint' })
  blogId: string;

  @Column({ name: 'blog_name', type: 'varchar' })
  blogName: string;

  @OneToMany(() => PostReactionOrmEntity, (reaction) => reaction.post)
  reactions?: PostReactionOrmEntity[];
}
