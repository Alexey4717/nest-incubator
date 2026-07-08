import { LikeStatus } from '@/modules/like/types/like-status';

import { CommentatorInfo } from '../types/view-models';

export type CommentReactionModel = {
  userId: string;
  likeStatus: LikeStatus;
  createdAt: string;
};

export type CommentModel = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  reactions: CommentReactionModel[];
};
