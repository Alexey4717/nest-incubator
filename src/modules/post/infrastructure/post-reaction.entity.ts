import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { LikeStatus } from '@/modules/like/types/like-status';

import { PostEntity } from './post.entity';

@Entity('post_reactions')
export class PostReactionEntity {
  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId: string;

  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  userId: string;

  @Column({ name: 'user_login', type: 'varchar' })
  userLogin: string;

  @Column({ name: 'like_status', type: 'varchar' })
  likeStatus: LikeStatus;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PostEntity, (post) => post.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;
}
