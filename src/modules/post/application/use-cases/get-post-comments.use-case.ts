import { Injectable } from '@nestjs/common';

import { Paginator, SortDirections } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';
import { normalizePaginationQuery } from '@/shared/utils/pagination';

import { getMappedCommentViewModel } from '@/modules/comment/helpers';
import { CommentQueryRepository } from '@/modules/comment/infrastructure/comment-query.repository.mongodb';
import { SortPostCommentsBy } from '@/modules/comment/models/GetPostCommentsInputModel';
import { CommentViewModel } from '@/modules/comment/types/view-models';

import { GetPostsInputModel } from '../../models/GetPostsInputModel';

type GetPostCommentsInput = {
  postId: string;
  query: GetPostsInputModel;
  currentUserId?: string | null;
};

@Injectable()
export class GetPostCommentsUseCase implements IUseCase<
  GetPostCommentsInput,
  Paginator<CommentViewModel[]> | null
> {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  async execute({
    postId,
    query,
    currentUserId,
  }: GetPostCommentsInput): Promise<Paginator<CommentViewModel[]> | null> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const pagination = normalizePaginationQuery<SortPostCommentsBy>(
      { sortBy, sortDirection, pageNumber, pageSize },
      {
        sortBy: 'createdAt' as SortPostCommentsBy,
        sortDirection: SortDirections.desc,
        pageNumber: 1,
        pageSize: 10,
      },
    );

    const resData = await this.commentQueryRepository.getPostComments({
      postId,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });

    if (!resData) return null;

    const { pagesCount, page, pageSize: responsePageSize, totalCount, items } = resData;

    return {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items: items.map((item) =>
        getMappedCommentViewModel({ ...item, currentUserId: currentUserId ?? undefined }),
      ),
    };
  }
}
