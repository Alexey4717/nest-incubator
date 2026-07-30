import { Column, Entity, OneToMany } from 'typeorm';

import { BaseOrmEntity } from '@/modules/database/base.orm-entity';

import { CommentReactionEntity } from './comment-reaction.entity';

@Entity('comments')
export class CommentOrmEntity extends BaseOrmEntity {
  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'user_login', type: 'varchar' })
  userLogin: string;

  @OneToMany(() => CommentReactionEntity, (reaction) => reaction.comment)
  reactions?: CommentReactionEntity[];
}
