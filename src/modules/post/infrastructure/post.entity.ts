import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { PostReactionEntity } from './post-reaction.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ name: 'short_description', type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'blog_id', type: 'uuid' })
  blogId: string;

  @Column({ name: 'blog_name', type: 'varchar' })
  blogName: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => PostReactionEntity, (reaction) => reaction.post)
  reactions?: PostReactionEntity[];
}
