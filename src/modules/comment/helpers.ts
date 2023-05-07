import {
  GetMappedCommentOutputModel,
  LikesInfo,
  TCommentDb,
  TReactions,
} from './models/GetCommentOutputModel';
import { LikeStatus } from '../../types/common';

export const getMappedCommentViewModel = ({
  id,
  content,
  commentatorInfo,
  createdAt,
  reactions,
  currentUserId,
}: TCommentDb & { currentUserId?: string }): GetMappedCommentOutputModel => {
  const { userId, userLogin } = commentatorInfo || {};

  const likesInfo =
    reactions?.length > 0
      ? reactions.reduce(
          (result: LikesInfo, reaction: TReactions) => {
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
          },
        )
      : {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
        };

  return {
    id,
    content,
    commentatorInfo: {
      userId,
      userLogin,
    },
    createdAt,
    likesInfo,
  };
};
