import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';

import { ConfirmEmailUseCase } from '../use-cases/confirm-email.use-case';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand, ResultType<null>> {
  constructor(private readonly confirmEmailUseCase: ConfirmEmailUseCase) {}

  execute(command: ConfirmEmailCommand): Promise<ResultType<null>> {
    return this.confirmEmailUseCase.execute(command.code);
  }
}
