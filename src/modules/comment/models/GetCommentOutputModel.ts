import { LikesInfoViewModel } from '@/modules/like/types/view-models';

import { CommentatorInfo } from '../types/view-models';

export type GetCommentOutputModel = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfoViewModel;
};

export type GetCommentOutputModelFromDB = GetCommentOutputModel & {
  id: string;
};
