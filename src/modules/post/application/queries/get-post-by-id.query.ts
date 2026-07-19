import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { PostViewModel } from '../../types/view-models';
import { GetPostByIdUseCase } from '../use-cases/get-post-by-id.use-case';

export class GetPostByIdQuery extends TypedQuery<PostViewModel | null> {
  constructor(
    public readonly id: string,
    public readonly currentUserId?: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler implements IQueryHandler<GetPostByIdQuery, PostViewModel | null> {
  constructor(private readonly getPostByIdUseCase: GetPostByIdUseCase) {}

  execute(query: GetPostByIdQuery): Promise<PostViewModel | null> {
    return this.getPostByIdUseCase.execute({
      id: query.id,
      currentUserId: query.currentUserId,
    });
  }
}
