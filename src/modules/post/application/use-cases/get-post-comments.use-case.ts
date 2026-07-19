import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Paginator } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';

import { CommentViewMapper } from '@/modules/comment/comment.view-mapper';
import { GetPostCommentsQueryParamsDto } from '@/modules/comment/dto/get-post-comments-query-params.dto';
import { CommentQueryRepository } from '@/modules/comment/infrastructure/comment-query.repository';
import { CommentViewModel } from '@/modules/comment/types/view-models';

type GetPostCommentsInput = {
  postId: string;
  query: GetPostCommentsQueryParamsDto;
  currentUserId?: string | null;
};

@Injectable()
export class GetPostCommentsUseCase implements IUseCase<
  GetPostCommentsInput,
  Paginator<CommentViewModel[]> | null
> {
  constructor(
    @Inject(forwardRef(() => CommentQueryRepository))
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly commentViewMapper: CommentViewMapper,
  ) {}

  async execute({
    postId,
    query,
    currentUserId,
  }: GetPostCommentsInput): Promise<Paginator<CommentViewModel[]> | null> {
    const resData = await this.commentQueryRepository.getPostComments(postId, query);

    if (!resData) return null;

    return {
      ...resData,
      items: resData.items.map((item) =>
        this.commentViewMapper.toCommentViewModel(item, currentUserId ?? undefined),
      ),
    };
  }
}
