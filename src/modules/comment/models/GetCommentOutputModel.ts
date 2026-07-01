import { LikeStatus } from '@/modules/like/types/like-status';
import { LikesInfoViewModel } from '@/modules/like/types/view-models';

import { CommentatorInfo } from '../types/view-models';

export type GetCommentOutputModel = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
};

export type TReactions = {
  userId: string;
  likeStatus: LikeStatus;
  createdAt: string;
};

export type TCommentDb = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  reactions: TReactions[];
};
