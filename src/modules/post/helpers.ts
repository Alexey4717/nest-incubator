import {
  ExtendedLikesInfo,
  GetMappedPostOutputModel,
  NewestLikeType,
  TPostDb,
  TReactions as TReactionsPost,
} from './models/GetPostOutputModel';
import { LikeStatus } from '../../types/common';

export const getMappedPostViewModel = ({
  id,
  title,
  content,
  shortDescription,
  blogName,
  blogId,
  createdAt,
  currentUserId,
  reactions,
}: TPostDb & { currentUserId?: string }): GetMappedPostOutputModel => {
  const extendedLikesInfo =
    reactions?.length > 0
      ? reactions.reduce(
          (result: ExtendedLikesInfo, reaction: TReactionsPost) => {
            if (reaction.likeStatus === LikeStatus.Like) {
              const currentReaction = {
                userId: reaction.userId,
                login: reaction.userLogin,
                addedAt: reaction.createdAt,
              };

              result.newestLikes.push(currentReaction);

              if (result.newestLikes.length > 1) {
                result.newestLikes.sort(
                  (a: NewestLikeType, b: NewestLikeType) => {
                    if (
                      new Date(a.addedAt).valueOf() <
                      new Date(b.addedAt).valueOf()
                    )
                      return 1;
                    if (
                      new Date(a.addedAt).valueOf() ===
                      new Date(b.addedAt).valueOf()
                    )
                      return 0;
                    return -1;
                  },
                );
              }

              if (result.newestLikes.length === 4) {
                result.newestLikes.splice(3, 1);
              }
            }

            if (reaction.likeStatus === LikeStatus.Like) result.likesCount += 1;
            if (reaction.likeStatus === LikeStatus.Dislike)
              result.dislikesCount += 1;
            if (reaction.userId === currentUserId) {
              result.myStatus = reaction.likeStatus;
            }
            return result;
          },
          {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: [],
          },
        )
      : {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        };

  return {
    id,
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    createdAt,
    extendedLikesInfo,
  };
};
