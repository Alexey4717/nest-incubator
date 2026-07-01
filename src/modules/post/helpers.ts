import { ReactionsMapperService } from '@/modules/like/application/services/reactions-mapper.service';

import { TPostDb } from './models/GetPostOutputModel';
import { PostViewModel } from './types/view-models';

const reactionsMapper = new ReactionsMapperService();

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
}: TPostDb & { currentUserId?: string | null }): PostViewModel => ({
  id,
  title,
  shortDescription,
  content,
  blogId,
  blogName,
  createdAt,
  extendedLikesInfo: reactionsMapper.mapReactionsToExtendedLikesInfo(
    reactions,
    currentUserId ?? undefined,
  ),
});
