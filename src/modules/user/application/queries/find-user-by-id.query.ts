import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id.use-case';

export class FindUserByIdQuery extends TypedQuery<GetUserOutputModelFromMongoDB | null> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdHandler implements IQueryHandler<
  FindUserByIdQuery,
  GetUserOutputModelFromMongoDB | null
> {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  execute(query: FindUserByIdQuery): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.findUserByIdUseCase.execute(query.id);
  }
}
