import { LikeStatus } from '../../../types/common';

type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type GetCommentOutputModel = {
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: string;
  likesInfo: LikesInfo;
};

export type GetMappedCommentOutputModel = GetCommentOutputModel & {
  id: string;
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
  commentatorInfo: CommentatorInfoType;
  createdAt: string;
  reactions: TReactions[];
};
