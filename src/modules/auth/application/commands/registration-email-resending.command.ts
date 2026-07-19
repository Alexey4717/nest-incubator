import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result as ResultType } from '@/core/result/result.types';

import { RegistrationEmailResendingUseCase } from '../use-cases/registration-email-resending.use-case';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler implements ICommandHandler<
  RegistrationEmailResendingCommand,
  ResultType<null>
> {
  constructor(
    private readonly registrationEmailResendingUseCase: RegistrationEmailResendingUseCase,
  ) {}

  execute(command: RegistrationEmailResendingCommand): Promise<ResultType<null>> {
    return this.registrationEmailResendingUseCase.execute(command.email);
  }
}
