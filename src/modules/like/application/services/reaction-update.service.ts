import { Injectable } from '@nestjs/common';

import { LikeStatus } from '../../types/like-status';
import { Reaction } from '../../types/reaction.type';

export type ReactionUpdatePlan =
  | { action: 'noop' }
  | { action: 'push'; reaction: Reaction }
  | { action: 'pull'; userId: string }
  | {
      action: 'update';
      userId: string;
      likeStatus: LikeStatus;
      createdAt: string;
    };

@Injectable()
export class ReactionUpdateService {
  planReactionUpdate({
    reactions,
    userId,
    likeStatus,
    userLogin,
  }: {
    reactions: Reaction[];
    userId: string;
    likeStatus: LikeStatus;
    userLogin?: string;
  }): ReactionUpdatePlan {
    const existingReaction = reactions.find((reaction) => reaction.userId === userId);
    const createdAt = new Date().toISOString();

    if (likeStatus === LikeStatus.None) {
      if (!existingReaction) {
        return { action: 'noop' };
      }

      return { action: 'pull', userId };
    }

    if (!existingReaction) {
      return {
        action: 'push',
        reaction: {
          userId,
          likeStatus,
          createdAt,
          ...(userLogin !== undefined && { userLogin }),
        },
      };
    }

    if (existingReaction.likeStatus === likeStatus) {
      return { action: 'noop' };
    }

    return {
      action: 'update',
      userId,
      likeStatus,
      createdAt,
    };
  }
}
