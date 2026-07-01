import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/shared/types/cqrs-augmentation';

import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import { CheckCredentialsUseCase } from '../use-cases/check-credentials.use-case';

type CheckCredentialsInput = {
  loginOrEmail: string;
  password: string;
};

export class CheckCredentialsQuery extends TypedQuery<GetUserOutputModelFromMongoDB | null> {
  constructor(public readonly input: CheckCredentialsInput) {
    super();
  }
}

@QueryHandler(CheckCredentialsQuery)
export class CheckCredentialsHandler implements IQueryHandler<
  CheckCredentialsQuery,
  GetUserOutputModelFromMongoDB | null
> {
  constructor(private readonly checkCredentialsUseCase: CheckCredentialsUseCase) {}

  execute(query: CheckCredentialsQuery): Promise<GetUserOutputModelFromMongoDB | null> {
    return this.checkCredentialsUseCase.execute(query.input);
  }
}
