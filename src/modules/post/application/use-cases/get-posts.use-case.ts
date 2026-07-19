import { Injectable } from '@nestjs/common';

import { Paginator } from '@/core/types/common';
import { IUseCase } from '@/core/types/use-case';

import { GetPostsQueryParamsDto } from '../../dto/get-posts-query-params.dto';
import { PostQueryRepository } from '../../infrastructure/post-query.repository';
import { PostViewMapper } from '../../post.view-mapper';
import { PostViewModel } from '../../types/view-models';

type GetPostsInput = {
  query: GetPostsQueryParamsDto;
  currentUserId?: string | null;
};

@Injectable()
export class GetPostsUseCase implements IUseCase<GetPostsInput, Paginator<PostViewModel[]>> {
  constructor(
    private readonly postQueryRepository: PostQueryRepository,
    private readonly postViewMapper: PostViewMapper,
  ) {}

  async execute({ query, currentUserId }: GetPostsInput): Promise<Paginator<PostViewModel[]>> {
    const resData = await this.postQueryRepository.getPosts(query);

    return {
      ...resData,
      items: resData.items.map((item) => this.postViewMapper.toPostViewModel(item, currentUserId)),
    };
  }
}
