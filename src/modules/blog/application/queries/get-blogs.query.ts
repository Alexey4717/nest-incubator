import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/shared/types/common';
import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { GetBlogsInputModel } from '../../models/GetBlogsInputModel';
import { BlogViewModel } from '../../types/view-models';
import { GetBlogsUseCase } from '../use-cases/get-blogs.use-case';

export class GetBlogsQuery extends TypedQuery<Paginator<BlogViewModel[]>> {
  constructor(public readonly input: GetBlogsInputModel) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsHandler implements IQueryHandler<GetBlogsQuery, Paginator<BlogViewModel[]>> {
  constructor(private readonly getBlogsUseCase: GetBlogsUseCase) {}

  execute(query: GetBlogsQuery): Promise<Paginator<BlogViewModel[]>> {
    return this.getBlogsUseCase.execute(query.input);
  }
}
