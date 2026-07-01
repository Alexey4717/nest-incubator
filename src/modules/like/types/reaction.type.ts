import { LikeStatus } from './like-status';

export type Reaction = {
  userId: string;
  likeStatus: LikeStatus;
  createdAt: string;
  userLogin?: string;
};
