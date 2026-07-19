import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { CommentReactionEntity } from './comment-reaction.entity';

@Entity('comments')
export class CommentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'user_login', type: 'varchar' })
  userLogin: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => CommentReactionEntity, (reaction) => reaction.comment)
  reactions?: CommentReactionEntity[];
}
