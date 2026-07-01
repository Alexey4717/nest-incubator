import { ExtendedLikesInfoViewModel } from '@/modules/like/types/view-models';

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt?: string;
  extendedLikesInfo: ExtendedLikesInfoViewModel;
};
