import { LikeStatus } from './like-status';

export type LikeDetailsViewModel = {
  addedAt: string;
  userId?: string;
  login?: string;
};

export type LikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type ExtendedLikesInfoViewModel = LikesInfoViewModel & {
  newestLikes?: LikeDetailsViewModel[] | null;
};
