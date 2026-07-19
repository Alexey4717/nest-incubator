import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { BlogModel } from '../../models/blog.model';
import { GetBlogByIdUseCase } from '../use-cases/get-blog-by-id.use-case';

export class GetBlogByIdQuery extends TypedQuery<BlogModel | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdHandler implements IQueryHandler<GetBlogByIdQuery, BlogModel | null> {
  constructor(private readonly getBlogByIdUseCase: GetBlogByIdUseCase) {}

  execute(query: GetBlogByIdQuery): Promise<BlogModel | null> {
    return this.getBlogByIdUseCase.execute(query.id);
  }
}
