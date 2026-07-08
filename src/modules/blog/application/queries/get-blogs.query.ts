import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/shared/types/common';
import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { BlogModel } from '../../models/blog.model';
import { GetBlogsInputModel } from '../../models/GetBlogsInputModel';
import { GetBlogsUseCase } from '../use-cases/get-blogs.use-case';

export class GetBlogsQuery extends TypedQuery<Paginator<BlogModel[]>> {
  constructor(public readonly input: GetBlogsInputModel) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsHandler implements IQueryHandler<GetBlogsQuery, Paginator<BlogModel[]>> {
  constructor(private readonly getBlogsUseCase: GetBlogsUseCase) {}

  execute(query: GetBlogsQuery): Promise<Paginator<BlogModel[]>> {
    return this.getBlogsUseCase.execute(query.input);
  }
}
