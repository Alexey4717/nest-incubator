import { ExtendedLikesInfoViewModel } from '@/modules/like/types/view-models';

export type GetPostOutputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
};

export type GetPostOutputModelFromDB = GetPostOutputModel & {
  id: string;
};
