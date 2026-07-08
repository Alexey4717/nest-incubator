import { Injectable } from '@nestjs/common';

import { ReactionsMapperService } from '@/modules/like/application/services/reactions-mapper.service';

import { PostModel } from './models/post.model';
import { PostViewModel } from './types/view-models';

@Injectable()
export class PostViewMapper {
  constructor(private readonly reactionsMapper: ReactionsMapperService) {}

  toPostViewModel(model: PostModel, currentUserId?: string | null): PostViewModel {
    const { id, title, content, shortDescription, blogName, blogId, createdAt, reactions } = model;

    return {
      id,
      title,
      shortDescription,
      content,
      blogId,
      blogName,
      createdAt,
      extendedLikesInfo: this.reactionsMapper.mapReactionsToExtendedLikesInfo(
        reactions,
        currentUserId ?? undefined,
      ),
    };
  }
}
