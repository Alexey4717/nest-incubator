import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/core/types/common';
import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { GetBlogsQueryParamsDto } from '../../dto/get-blogs-query-params.dto';
import { BlogModel } from '../../models/blog.model';
import { GetBlogsUseCase } from '../use-cases/get-blogs.use-case';

export class GetBlogsQuery extends TypedQuery<Paginator<BlogModel[]>> {
  constructor(public readonly input: GetBlogsQueryParamsDto) {
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
