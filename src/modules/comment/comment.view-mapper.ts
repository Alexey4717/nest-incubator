import { Injectable } from '@nestjs/common';

import { ReactionsMapperService } from '@/modules/like/application/services/reactions-mapper.service';

import { CommentModel } from './models/comment.model';
import { CommentViewModel } from './types/view-models';

@Injectable()
export class CommentViewMapper {
  constructor(private readonly reactionsMapper: ReactionsMapperService) {}

  toCommentViewModel(model: CommentModel, currentUserId?: string): CommentViewModel {
    const { id, content, commentatorInfo, createdAt, reactions } = model;
    const { userId, userLogin } = commentatorInfo || {};

    return {
      id,
      content,
      commentatorInfo: {
        userId,
        userLogin,
      },
      createdAt,
      likesInfo: this.reactionsMapper.mapReactionsToBaseLikesInfo(reactions, currentUserId),
    };
  }
}
