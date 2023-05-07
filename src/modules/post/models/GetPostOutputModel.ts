import { LikeStatus } from '../../../types/common';

export type NewestLikeType = {
  addedAt: string;
  userId: string;
  login: string;
};
export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikeType[];
};

export type GetPostOutputModel = {
  /**
   * Title of post from db, required.
   */
  title: string;

  /**
   * Short description of post from db, required.
   */
  shortDescription: string;

  /**
   * Content of post from db, required.
   */
  content: string;

  /**
   * blogId of post from db, required.
   */
  blogId: string;

  /**
   * Blog name of post from db, required.
   */
  blogName: string;

  /**
   * Date of post creation in db.
   */
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type GetPostOutputModelFromMongoDB = GetPostOutputModel & {
  /**
   * Id of post from mongoDB.
   */
  id: string;
};

export type GetMappedPostOutputModel = GetPostOutputModel & {
  /**
   * Id of post from db, required.
   */
  id: string;
};

export type TReactions = {
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
  createdAt: string;
};

export type TPostDb = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  reactions: TReactions[];
};
