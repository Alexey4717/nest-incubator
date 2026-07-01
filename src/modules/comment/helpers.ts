import { ReactionsMapperService } from '@/modules/like/application/services/reactions-mapper.service';

import { TCommentDb } from './models/GetCommentOutputModel';
import { CommentViewModel } from './types/view-models';

const reactionsMapper = new ReactionsMapperService();

export const getMappedCommentViewModel = ({
  id,
  content,
  commentatorInfo,
  createdAt,
  reactions,
  currentUserId,
}: TCommentDb & { currentUserId?: string }): CommentViewModel => {
  const { userId, userLogin } = commentatorInfo || {};

  return {
    id,
    content,
    commentatorInfo: {
      userId,
      userLogin,
    },
    createdAt,
    likesInfo: reactionsMapper.mapReactionsToBaseLikesInfo(reactions, currentUserId),
  };
};
