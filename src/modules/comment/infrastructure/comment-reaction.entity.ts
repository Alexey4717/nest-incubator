import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { LikeStatus } from '@/modules/like/types/like-status';

import { CommentOrmEntity } from './comment.orm-entity';

@Entity('comment_reactions')
export class CommentReactionEntity {
  @PrimaryColumn({ name: 'comment_id', type: 'bigint' })
  commentId: string;

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'like_status', type: 'varchar' })
  likeStatus: LikeStatus;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => CommentOrmEntity, (comment) => comment.reactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: CommentOrmEntity;
}
