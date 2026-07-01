import { Injectable } from '@nestjs/common';

import { LikeStatus } from '../../types/like-status';
import { Reaction } from '../../types/reaction.type';
import {
  ExtendedLikesInfoViewModel,
  LikeDetailsViewModel,
  LikesInfoViewModel,
} from '../../types/view-models';

@Injectable()
export class ReactionsMapperService {
  private emptyLikesInfo(): LikesInfoViewModel {
    return {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    };
  }

  private applyReactionToLikesInfo<T extends LikesInfoViewModel>(
    result: T,
    reaction: Reaction,
    currentUserId?: string,
  ): T {
    if (reaction.likeStatus === LikeStatus.Like) result.likesCount += 1;
    if (reaction.likeStatus === LikeStatus.Dislike) result.dislikesCount += 1;
    if (reaction.userId === currentUserId) {
      result.myStatus = reaction.likeStatus;
    }
    return result;
  }

  mapReactionsToBaseLikesInfo(
    reactions: Reaction[] | undefined,
    currentUserId?: string,
  ): LikesInfoViewModel {
    if (!reactions?.length) {
      return this.emptyLikesInfo();
    }

    return reactions.reduce(
      (result, reaction) => this.applyReactionToLikesInfo(result, reaction, currentUserId),
      this.emptyLikesInfo(),
    );
  }

  mapReactionsToExtendedLikesInfo(
    reactions: Reaction[] | undefined,
    currentUserId?: string,
  ): ExtendedLikesInfoViewModel {
    if (!reactions?.length) {
      return { ...this.emptyLikesInfo(), newestLikes: [] };
    }

    return reactions.reduce<ExtendedLikesInfoViewModel>(
      (result, reaction) => {
        if (reaction.likeStatus === LikeStatus.Like) {
          const newestLike: LikeDetailsViewModel = {
            userId: reaction.userId,
            login: reaction.userLogin ?? '',
            addedAt: reaction.createdAt ?? '',
          };
          result.newestLikes = result.newestLikes ?? [];
          result.newestLikes.push(newestLike);

          if (result.newestLikes.length > 1) {
            result.newestLikes.sort((a, b) => {
              if (new Date(a.addedAt).valueOf() < new Date(b.addedAt).valueOf()) return 1;
              if (new Date(a.addedAt).valueOf() === new Date(b.addedAt).valueOf()) return 0;
              return -1;
            });
          }

          if (result.newestLikes.length === 4) {
            result.newestLikes.splice(3, 1);
          }
        }

        return this.applyReactionToLikesInfo(result, reaction, currentUserId);
      },
      { ...this.emptyLikesInfo(), newestLikes: [] },
    );
  }
}
