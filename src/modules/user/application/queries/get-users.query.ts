import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/shared/types/common';
import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { GetUsersQueryParamsDto } from '../../dto/get-users-query-params.dto';
import { UserViewModel } from '../../types/view-models';
import { GetUsersUseCase } from '../use-cases/get-users.use-case';

export class GetUsersQuery extends TypedQuery<Paginator<UserViewModel[]>> {
  constructor(public readonly input: GetUsersQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, Paginator<UserViewModel[]>> {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  execute(query: GetUsersQuery): Promise<Paginator<UserViewModel[]>> {
    return this.getUsersUseCase.execute(query.input);
  }
}
