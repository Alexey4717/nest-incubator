import { randomUUID } from 'crypto';

import { PostOrmEntity } from '../../infrastructure/post.orm-entity';

export type PostCreateProps = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostUpdateProps = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type LikeCounts = {
  likesCount: number;
  dislikesCount: number;
};

export type PostDb = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
};

export class PostEntity {
  private constructor(private data: PostDb) {}

  static create(props: PostCreateProps, blogName: string): PostEntity {
    return new PostEntity({
      id: randomUUID(),
      title: props.title,
      shortDescription: props.shortDescription,
      content: props.content,
      blogId: props.blogId,
      blogName,
      createdAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
    });
  }

  static reconstitute(raw: PostOrmEntity | PostDb): PostEntity {
    return new PostEntity({
      id: raw.id,
      title: raw.title,
      shortDescription: raw.shortDescription,
      content: raw.content,
      blogId: raw.blogId,
      blogName: raw.blogName,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt),
      likesCount: 'likesCount' in raw ? raw.likesCount : 0,
      dislikesCount: 'dislikesCount' in raw ? raw.dislikesCount : 0,
    });
  }

  get id(): string {
    return this.data.id;
  }

  toDb(): PostDb {
    return { ...this.data };
  }

  update(props: PostUpdateProps, blogName: string): void {
    this.data = { ...this.data, ...props, blogName };
  }

  applyLikeCounts(counts: LikeCounts): void {
    this.data = {
      ...this.data,
      likesCount: counts.likesCount,
      dislikesCount: counts.dislikesCount,
    };
  }
}
