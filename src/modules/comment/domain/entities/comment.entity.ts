import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { generatePublicId } from '@/core/utils/public-id.generator';

import { CommentOrmEntity } from '../../infrastructure/comment.orm-entity';

export type CommentCreateProps = {
  postId: string;
  userId: string;
  userLogin: string;
  content: string;
};

export type LikeCounts = {
  likesCount: number;
  dislikesCount: number;
};

export type CommentDb = {
  id: string;
  postId: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
};

export class CommentEntity {
  private constructor(private data: CommentDb) {}

  static create(props: CommentCreateProps): CommentEntity {
    return new CommentEntity({
      id: generatePublicId(),
      postId: props.postId,
      content: props.content,
      userId: props.userId,
      userLogin: props.userLogin,
      createdAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
    });
  }

  static reconstitute(raw: CommentOrmEntity | CommentDb): CommentEntity {
    return new CommentEntity({
      id: 'publicId' in raw ? raw.publicId : raw.id,
      postId: raw.postId,
      content: raw.content,
      userId: raw.userId,
      userLogin: raw.userLogin,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt),
      likesCount: 'likesCount' in raw ? raw.likesCount : 0,
      dislikesCount: 'dislikesCount' in raw ? raw.dislikesCount : 0,
    });
  }

  get id(): string {
    return this.data.id;
  }

  toDb(): CommentDb {
    return { ...this.data };
  }

  canBeModifiedBy(userId: string): void {
    if (this.data.userId !== userId) {
      throw new DomainException(DomainExceptionCode.Forbidden);
    }
  }

  update(content: string): void {
    this.data = { ...this.data, content };
  }

  applyLikeCounts(counts: LikeCounts): void {
    this.data = {
      ...this.data,
      likesCount: counts.likesCount,
      dislikesCount: counts.dislikesCount,
    };
  }
}
