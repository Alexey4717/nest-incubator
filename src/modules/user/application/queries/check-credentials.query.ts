import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { UserModel } from '../../models/user.model';
import { CheckCredentialsUseCase } from '../use-cases/check-credentials.use-case';

type CheckCredentialsQueryInput = {
  loginOrEmail: string;
  password: string;
};

export class CheckCredentialsQuery extends TypedQuery<UserModel | null> {
  constructor(public readonly input: CheckCredentialsQueryInput) {
    super();
  }
}

@QueryHandler(CheckCredentialsQuery)
export class CheckCredentialsHandler implements IQueryHandler<
  CheckCredentialsQuery,
  UserModel | null
> {
  constructor(private readonly checkCredentialsUseCase: CheckCredentialsUseCase) {}

  execute(query: CheckCredentialsQuery): Promise<UserModel | null> {
    return this.checkCredentialsUseCase.execute(query.input);
  }
}
