import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { UserModel } from '../../models/user.model';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id.use-case';

export class FindUserByIdQuery extends TypedQuery<UserModel | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<FindUserByIdQuery, UserModel | null> {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  execute(query: FindUserByIdQuery): Promise<UserModel | null> {
    return this.findUserByIdUseCase.execute(query.id);
  }
}
