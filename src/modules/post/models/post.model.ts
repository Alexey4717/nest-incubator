import { LikeStatus } from '@/modules/like/types/like-status';

export type PostReactionModel = {
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
  createdAt: string;
};

export type PostModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  reactions: PostReactionModel[];
};
