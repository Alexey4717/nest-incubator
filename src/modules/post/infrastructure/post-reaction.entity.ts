import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { LikeStatus } from '@/modules/like/types/like-status';

import { PostOrmEntity } from './post.orm-entity';

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

  @ManyToOne(() => PostOrmEntity, (post) => post.reactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: PostOrmEntity;
}
