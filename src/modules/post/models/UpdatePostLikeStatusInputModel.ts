import { LikeStatus } from '@/shared/types/common';

export type UpdatePostLikeStatusInputModel = {
  /**
   * Update likeStatus of post. Required.
   */
  likeStatus: LikeStatus;
};
