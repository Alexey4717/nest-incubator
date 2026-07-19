import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Paginator } from '@/core/types/common';
import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { GetUsersQueryParamsDto } from '../../dto/get-users-query-params.dto';
import { UserModel } from '../../models/user.model';
import { GetUsersUseCase } from '../use-cases/get-users.use-case';

export class GetUsersQuery extends TypedQuery<Paginator<UserModel[]>> {
  constructor(public readonly input: GetUsersQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, Paginator<UserModel[]>> {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  execute(query: GetUsersQuery): Promise<Paginator<UserModel[]>> {
    return this.getUsersUseCase.execute(query.input);
  }
}
