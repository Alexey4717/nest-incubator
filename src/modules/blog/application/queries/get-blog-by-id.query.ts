import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { BlogViewModel } from '../../types/view-models';
import { GetBlogByIdUseCase } from '../use-cases/get-blog-by-id.use-case';

export class GetBlogByIdQuery extends TypedQuery<BlogViewModel | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdHandler implements IQueryHandler<GetBlogByIdQuery, BlogViewModel | null> {
  constructor(private readonly getBlogByIdUseCase: GetBlogByIdUseCase) {}

  execute(query: GetBlogByIdQuery): Promise<BlogViewModel | null> {
    return this.getBlogByIdUseCase.execute(query.id);
  }
}
