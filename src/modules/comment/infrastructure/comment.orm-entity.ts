import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

import { CommentReactionEntity } from './comment-reaction.entity';

@Entity('comments')
@Index('IDX_comments_post_id_created_at', ['postId', 'createdAt'])
export class CommentOrmEntity extends BaseOrmEntity {
  @Column({ name: 'post_id', type: 'bigint' })
  postId: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'user_login', type: 'varchar' })
  userLogin: string;

  @OneToMany(() => CommentReactionEntity, (reaction) => reaction.comment)
  reactions?: CommentReactionEntity[];
}
